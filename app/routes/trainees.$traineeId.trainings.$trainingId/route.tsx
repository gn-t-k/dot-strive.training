import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/cloudflare";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { getExercisesByTraineeId } from "app/features/exercise/get-exercises-by-trainee-id";
import { validateTrainee } from "app/features/trainee/schema";
import { findTrainingById } from "app/features/training/find-training-by-id";
import { TrainingForm } from "app/features/training/training-form";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "app/ui/alert-dialog";
import { Button } from "app/ui/button";
import { Main } from "app/ui/main";
import { useToast } from "app/ui/use-toast";
import { format } from "date-fns";
import { type FC, Suspense, useEffect } from "react";
import { deleteAction } from "./delete-action";
import { updateAction } from "./update-action";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const loaderData = (async () => {
    const { trainee } = await traineeLoader({ context, request, params });

    const { trainingId } = params;
    if (!trainingId) {
      throw redirect(`/trainees/${trainee.id}/trainings`);
    }

    const findTrainingResult = await findTrainingById(context)(trainingId);
    switch (findTrainingResult.result) {
      case "found": {
        const getExercisesResult = await getExercisesByTraineeId(context)(
          trainee.id,
        );
        if (getExercisesResult.result !== "success") {
          throw new Response("Internal Server Error", { status: 500 });
        }

        return {
          trainee,
          training: findTrainingResult.data,
          registeredExercises: getExercisesResult.data,
        };
      }
      case "not-found": {
        return { trainee, training: null };
      }
      case "failure": {
        throw new Response("Sorry, something went wrong.", { status: 500 });
      }
    }
  })();

  return { loaderData };
};

const Page: FC = () => {
  const { loaderData } = useLoaderData<typeof loader>();

  return (
    <Suspense>
      <Await resolve={loaderData}>
        {(loaderData) => <TrainingPage {...loaderData} />}
      </Await>
    </Suspense>
  );
};
export default Page;

type TrainingPageProps = Awaited<
  Awaited<ReturnType<typeof loader>>["loaderData"]
>;
const TrainingPage: FC<TrainingPageProps> = ({
  trainee,
  registeredExercises,
  training,
}) => {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) {
      return;
    }

    switch (actionData.action) {
      case "update": {
        if (actionData.success) {
          toast({ title: "トレーニングを更新しました" });
        } else {
          toast({
            title: "トレーニングの更新に失敗しました",
            variant: "destructive",
            description: actionData.description,
          });
        }
        break;
      }
      case "delete": {
        if (actionData.success) {
          toast({ title: "トレーニングを削除しました" });
          navigate(`/trainees/${trainee.id}/trainings`);
        } else {
          toast({
            title: "トレーニングの削除に失敗しました",
            variant: "destructive",
          });
        }
        break;
      }
    }
  }, [actionData, trainee.id, navigate, toast]);

  if (!training) {
    // 削除のactionをした直後はloaderData.training === nullになり、useEffectでリダイレクトされる
    return null;
  }

  const dateString = format(training.date, "yyyy年MM月dd日");

  return (
    <Main>
      <TrainingForm
        actionType="update"
        traineeId={trainee.id}
        registeredExercises={registeredExercises}
        defaultValue={{
          id: training.id,
          date: format(training.date, "yyyy-MM-dd"),
          sessions: training.sessions.map((session) => ({
            exerciseId: session.exercise.id,
            memo: session.memo,
            sets: session.sets.map((set) => ({
              weight: String(set.weight),
              reps: String(set.repetition),
              rpe: String(set.rpe),
            })),
          })),
        }}
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">トレーニングを削除する</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>トレーニングの削除</AlertDialogTitle>
            <AlertDialogDescription>
              {dateString}のトレーニングを削除しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <Form method="post">
              <input type="hidden" name="id" value={training.id} />
              <AlertDialogAction
                type="submit"
                name="actionType"
                value="delete"
                className="w-full"
              >
                削除
              </AlertDialogAction>
            </Form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Main>
  );
};

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }),
    request.formData(),
  ]);

  const validatedTrainee = validateTrainee(trainee);
  if (!validatedTrainee) {
    throw new Response("Bad Request", { status: 400 });
  }

  switch (formData.get("actionType")) {
    case "update": {
      return await updateAction({
        formData,
        context,
        trainee: validatedTrainee,
      });
    }
    case "delete": {
      return await deleteAction({
        formData,
        context,
        trainee: validatedTrainee,
      });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
