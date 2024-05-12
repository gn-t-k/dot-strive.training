import { createId } from "@paralleldrive/cuid2";
import { json } from "@remix-run/cloudflare";
import {
  Await,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { parseWithValibot } from "conform-to-valibot";
import { Suspense, useEffect } from "react";

import { getExercisesByTraineeId } from "app/features/exercise/get-exercises-by-trainee-id";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { validateExercise } from "app/features/exercise/schema";
import { createTraining } from "app/features/training/create-training";
import { validateTraining } from "app/features/training/schema";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import { Main } from "app/ui/main";
import { useToast } from "app/ui/use-toast";

import {
  TrainingForm,
  getTrainingFormSchema,
} from "../../features/training/training-form";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { format } from "date-fns";
import type { FC } from "react";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const loaderData = (async () => {
    const { trainee } = await traineeLoader({ context, request, params });

    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    const getExercisesResult = await getExercisesByTraineeId(context)(
      trainee.id,
    );
    if (getExercisesResult.result !== "success") {
      throw new Response("Internal Server Error", { status: 500 });
    }

    return { trainee, registeredExercises: getExercisesResult.data, date };
  })();

  return { loaderData };
};

const Page: FC = () => {
  const { loaderData } = useLoaderData<typeof loader>();

  return (
    <Suspense>
      <Await resolve={loaderData}>
        {(loaderData) => <NewTrainingPage {...loaderData} />}
      </Await>
    </Suspense>
  );
};
export default Page;

type NewTrainingPageProps = Awaited<
  Awaited<ReturnType<typeof loader>>["loaderData"]
>;
const NewTrainingPage: FC<NewTrainingPageProps> = ({
  trainee,
  registeredExercises,
  date,
}) => {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!actionData) {
      return;
    }
    switch (actionData.action) {
      case "create": {
        if (actionData.success) {
          toast({ title: "トレーニングを登録しました" });
          navigate(`/trainees/${trainee.id}/trainings`);
        } else {
          toast({
            title: "トレーニングの登録に失敗しました",
            variant: "destructive",
            description: actionData.description,
          });
        }
      }
    }
  }, [actionData, navigate, toast, trainee.id]);

  return (
    <Main>
      <TrainingForm
        actionType="create"
        registeredExercises={registeredExercises}
        defaultValue={{
          date: date ?? format(new Date(), "yyyy-MM-dd"),
          sessions: [
            {
              exerciseId: "",
              memo: "",
              sets: [{ weight: "", reps: "", rpe: "" }],
            },
          ],
        }}
      />
    </Main>
  );
};

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }),
    request.formData(),
  ]);

  const getExercisesResult = await getExercisesWithTagsByTraineeId(context)(
    trainee.id,
  );
  if (getExercisesResult.result !== "success") {
    return json({
      action: "create",
      success: false,
      description: "get exercises failed",
    });
  }
  const registeredExercises = getExercisesResult.data;

  const submission = parseWithValibot(formData, {
    schema: getTrainingFormSchema(registeredExercises),
  });
  if (submission.status !== "success") {
    return json({
      action: "create",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const training = validateTraining({
    id: createId(),
    date: new Date(submission.value.date),
    sessions: submission.value.sessions.flatMap((session) => {
      const exercise = validateExercise(
        registeredExercises.find(
          (registeredExercise) => registeredExercise.id === session.exerciseId,
        ),
      );
      if (!exercise) {
        return [];
      }

      return [
        {
          exercise,
          memo: session.memo,
          sets: session.sets,
        },
      ];
    }),
  });
  if (!training) {
    return json({
      action: "create",
      success: false,
      description: "domain validation failed",
    });
  }

  const createResult = await createTraining(context)({
    training,
    traineeId: trainee.id,
  });
  if (createResult.result === "failure") {
    return json({
      action: "create",
      success: false,
      description: createResult.error,
    });
  }

  return json({
    action: "create",
    success: true,
    description: "success",
    submission: submission.reply(),
  });
};
