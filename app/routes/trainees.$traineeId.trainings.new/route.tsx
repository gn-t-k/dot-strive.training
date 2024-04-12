import { createId } from "@paralleldrive/cuid2";
import { json } from "@remix-run/cloudflare";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { parseWithValibot } from "conform-to-valibot";
import { useEffect } from "react";

import { getExercisesByTraineeId } from "app/features/exercise/get-exercises-by-trainee-id";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { validateExercise } from "app/features/exercise/schema";
import { createTraining } from "app/features/training/create-training";
import { validateTraining } from "app/features/training/schema";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import { useToast } from "app/ui/use-toast";

import {
  TrainingForm,
  getTrainingFormSchema,
} from "../../features/training/training-form";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import type { FC } from "react";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(
    (response) => response.json(),
  );

  const getExercisesResult = await getExercisesByTraineeId(context)(trainee.id);
  if (getExercisesResult.result !== "success") {
    throw new Response("Internal Server Error", { status: 500 });
  }

  return json({ trainee, registeredExercises: getExercisesResult.data });
};

const Page: FC = () => {
  const { trainee, registeredExercises } = useLoaderData<typeof loader>();
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
    <TrainingForm
      actionType="create"
      registeredExercises={registeredExercises}
    />
  );
};
export default Page;

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }).then((response) =>
      response.json(),
    ),
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
