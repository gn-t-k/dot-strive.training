import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { ExerciseForm } from "app/features/exercise/exercise-form";
import { findExerciseById } from "app/features/exercise/find-exercise-by-id";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
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
import { type FC, useEffect } from "react";
import { deleteAction } from "./delete-action";
import { updateAction } from "./update-action";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(
    (response) => response.json(),
  );

  const { exerciseId } = params;
  if (!exerciseId) {
    return redirect(`/trainees/${trainee.id}/exercises`);
  }

  const findExerciseResult = await findExerciseById(context)(exerciseId);
  switch (findExerciseResult.result) {
    case "found": {
      const [getTagsResult, getExercisesResult] = await Promise.all([
        getTagsByTraineeId(context)(trainee.id),
        getExercisesWithTagsByTraineeId(context)(trainee.id),
      ]);
      if (
        !(
          getTagsResult.result === "success" &&
          getExercisesResult.result === "success"
        )
      ) {
        throw new Response("Internal Server Error", { status: 500 });
      }
      const [registeredTags, registeredExercises] = [
        getTagsResult.data,
        getExercisesResult.data,
      ];

      return json({
        trainee,
        exercise: findExerciseResult.data,
        registeredTags,
        registeredExercises,
      });
    }
    case "not-found": {
      return json({ trainee, exercise: null });
    }
    case "failure": {
      throw new Response("Sorry, something went wrong.", { status: 500 });
    }
  }
};

const Page: FC = () => {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { exercise, trainee } = loaderData;
  useEffect(() => {
    if (!actionData) {
      return;
    }

    switch (actionData.action) {
      case "update": {
        if (actionData.success) {
          toast({ title: "種目を更新しました" });
        } else {
          toast({ title: "種目の更新に失敗しました", variant: "destructive" });
        }
        break;
      }
      case "delete": {
        if (actionData.success) {
          toast({ title: "種目を削除しました" });
          navigate(`/trainees/${trainee.id}/exercises`);
        } else {
          toast({ title: "種目の削除に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, trainee.id, navigate, toast]);

  if (!exercise) {
    // 削除のactionをした直後はexerciseがnullになり、useEffectでリダイレクトされる
    return null;
  }

  const { registeredExercises, registeredTags } = loaderData;

  return (
    <Main>
      <ExerciseForm
        registeredTags={registeredTags}
        registeredExercises={registeredExercises}
        defaultValues={{
          id: exercise.id,
          name: exercise.name,
          tags: exercise.tags.map((tag) => tag.id),
        }}
        actionType="update"
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">種目を削除する</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>種目の削除</AlertDialogTitle>
            <AlertDialogDescription>
              {exercise.name}を削除しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <Form method="post">
              <input type="hidden" name="id" value={exercise.id} />
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
export default Page;

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const [{ trainee }, formData] = await Promise.all([
    traineeLoader({ context, request, params }).then((response) =>
      response.json(),
    ),
    request.formData(),
  ]);

  switch (formData.get("actionType")) {
    case "update": {
      return updateAction({ formData, context, trainee });
    }
    case "delete": {
      return deleteAction({ formData, context, trainee });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};