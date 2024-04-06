import { json } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getExercisesWithTargetsByTraineeId } from "app/features/exercise/get-exercises-with-targets-by-trainee-id";
import { getMusclesByTraineeId } from "app/features/muscle/get-muscles-by-trainee-id";
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
import { Card, CardContent, CardDescription, CardHeader } from "app/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "app/ui/dropdown-menu";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect } from "react";

import { ExerciseForm } from "./exercise-form";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import type { FC } from "react";
import { createAction } from "./create-action";
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
  const [getMusclesResult, getExercisesResult] = await Promise.all([
    getMusclesByTraineeId(context)(trainee.id),
    getExercisesWithTargetsByTraineeId(context)(trainee.id),
  ]);
  if (
    !(
      getMusclesResult.result === "success" &&
      getExercisesResult.result === "success"
    )
  ) {
    throw new Response("Internal Server Error", { status: 500 });
  }
  const [muscles, exercisesWithTargets] = [
    getMusclesResult.data,
    getExercisesResult.data,
  ];

  return json({ muscles, exercisesWithTargets });
};

const Page: FC = () => {
  const { muscles, exercisesWithTargets } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();

  useEffect(() => {
    if (!actionData) {
      return;
    }
    switch (actionData.action) {
      case "create": {
        if (actionData.success) {
          toast({ title: "種目を登録しました" });
        } else {
          toast({ title: "種目の登録に失敗しました", variant: "destructive" });
        }
        break;
      }
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
        } else {
          toast({ title: "種目の削除に失敗しました", variant: "destructive" });
        }
        break;
      }
    }
  }, [actionData, toast]);

  const exercises = exercisesWithTargets;

  return (
    <Main>
      <Section>
        <ul className="flex flex-col gap-4">
          {exercisesWithTargets.map((exercise) => {
            return (
              <li key={exercise.id}>
                <Card>
                  <CardHeader className="flex w-full space-x-2">
                    <div className="grow">
                      <Heading level={2}>{exercise.name}</Heading>
                      <CardDescription>
                        {exercise.targets
                          .map((target) => target.name)
                          .join("、")}
                      </CardDescription>
                    </div>
                    <div className="flex-none">
                      <Dialog>
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem>
                                  <DialogTrigger className="flex w-full">
                                    <Edit className="mr-2 size-4" />
                                    編集
                                  </DialogTrigger>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <AlertDialogTrigger className="flex w-full">
                                    <Trash2 className="mr-2 size-4" />
                                    削除
                                  </AlertDialogTrigger>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>種目の編集</DialogTitle>
                            </DialogHeader>
                            <ExerciseForm
                              registeredMuscles={muscles}
                              registeredExercises={exercises}
                              defaultValues={{
                                id: exercise.id,
                                name: exercise.name,
                                targets: exercise.targets.map(
                                  (target) => target.id,
                                ),
                              }}
                              actionType="update"
                            />
                          </DialogContent>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>種目の削除</AlertDialogTitle>
                              <AlertDialogDescription>
                                種目を削除しますか？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <Form method="post">
                                <input
                                  type="hidden"
                                  name="id"
                                  value={exercise.id}
                                />
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
                      </Dialog>
                    </div>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
        <Card>
          <CardHeader>
            <Heading level={2}>種目を登録する</Heading>
            <CardDescription>
              .STRIVEでは、種目に名前と対象の部位を設定することが出来ます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExerciseForm
              registeredMuscles={muscles}
              registeredExercises={exercises}
              actionType="create"
            />
          </CardContent>
        </Card>
      </Section>
    </Main>
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

  switch (formData.get("actionType")) {
    case "create": {
      return createAction({ formData, context, trainee });
    }
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
