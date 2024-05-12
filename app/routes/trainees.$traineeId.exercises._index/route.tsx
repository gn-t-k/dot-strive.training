import { Await, Link, useActionData, useLoaderData } from "@remix-run/react";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { loader as traineeLoader } from "app/routes/trainees.$traineeId/route";
import { Card, CardHeader } from "app/ui/card";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import { Suspense, useEffect } from "react";

import { ExerciseForm } from "../../features/exercise/exercise-form";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { validateTrainee } from "app/features/trainee/schema";
import { Badge } from "app/ui/badge";
import { Button } from "app/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "app/ui/dialog";
import type { FC } from "react";
import { createAction } from "./create-action";
import { ExercisesPageLoading } from "./exercises-page-loading";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const loaderData = (async () => {
    const { trainee } = await traineeLoader({ context, request, params });
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
    const [tags, exercises] = [getTagsResult.data, getExercisesResult.data];

    return { trainee, tags, exercises };
  })();

  return { loaderData };
};

const Page: FC = () => {
  const { loaderData } = useLoaderData<typeof loader>();
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

  return (
    <Suspense fallback={<ExercisesPageLoading />}>
      <Await resolve={loaderData}>
        {({ trainee, tags, exercises }) => (
          <ExercisesPage trainee={trainee} exercises={exercises} tags={tags} />
        )}
      </Await>
    </Suspense>
  );
};
export default Page;

type ExercisesPageProps = Awaited<
  Awaited<ReturnType<typeof loader>>["loaderData"]
>;
const ExercisesPage: FC<ExercisesPageProps> = ({
  trainee,
  exercises,
  tags,
}) => {
  return (
    <Main>
      <header>
        <Heading level={1} size="lg">
          種目
        </Heading>
        <p className="text-muted-foreground">
          .STRIVEでは、トレーニングの種目を自由に登録・編集できます。
        </p>
        <p className="text-muted-foreground">
          種目の記録を追跡したり、量・強度・頻度を管理することができます。
        </p>
      </header>
      <Section>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">種目を登録する</Button>
          </DialogTrigger>
          <DialogContent className="max-h-dvh overflow-auto">
            <DialogHeader>
              <DialogTitle>種目を登録する</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <ExerciseForm
              registeredTags={tags}
              registeredExercises={exercises}
              actionType="create"
            />
          </DialogContent>
        </Dialog>
      </Section>
      <Section>
        <Heading level={2}>登録されている種目</Heading>
        <ul className="flex flex-col gap-4">
          {exercises.map((exercise) => {
            return (
              <li key={exercise.id}>
                <Card>
                  <CardHeader className="flex flex-col gap-2">
                    <Link
                      to={`/trainees/${trainee.id}/exercises/${exercise.id}`}
                    >
                      <Heading level={2} className="underline">
                        {exercise.name}
                      </Heading>
                    </Link>
                    <ul className="inline leading-relaxed">
                      {exercise.tags.map((tag, index) => {
                        return (
                          <li className="inline mr-1" key={`${index}_${tag}`}>
                            <Link to={`/trainees/${trainee.id}/tags/${tag.id}`}>
                              <Badge variant="outline">#{tag.name}</Badge>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      </Section>
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

  const validatedTrainee = validateTrainee(trainee);
  if (!validatedTrainee) {
    throw new Response("Bad Request", { status: 400 });
  }

  switch (formData.get("actionType")) {
    case "create": {
      return createAction({ formData, context, trainee: validatedTrainee });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
