import { json } from "@remix-run/cloudflare";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import {} from "app/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader } from "app/ui/card";
import {} from "app/ui/dialog";
import {} from "app/ui/dropdown-menu";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import {} from "lucide-react";
import { useEffect } from "react";

import { ExerciseForm } from "../../features/exercise/exercise-form";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import type { FC } from "react";
import { createAction } from "./create-action";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const { trainee } = await traineeLoader({ context, request, params }).then(
    (response) => response.json(),
  );
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
  const [tags, exercisesWithTags] = [
    getTagsResult.data,
    getExercisesResult.data,
  ];

  return json({ trainee, tags, exercisesWithTags });
};

const Page: FC = () => {
  const { trainee, tags, exercisesWithTags } = useLoaderData<typeof loader>();
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
    }
  }, [actionData, toast]);

  const exercises = exercisesWithTags;

  return (
    <Main>
      <Section>
        <ul className="flex flex-col gap-4">
          {exercisesWithTags.map((exercise) => {
            return (
              <li key={exercise.id}>
                <Link to={`/trainees/${trainee.id}/exercises/${exercise.id}`}>
                  <Card>
                    <CardHeader className="flex flex-col gap-2">
                      <Heading level={2}>{exercise.name}</Heading>
                      <CardDescription>
                        {exercise.tags.map((tag) => tag.name).join("、")}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
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
              registeredTags={tags}
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
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
