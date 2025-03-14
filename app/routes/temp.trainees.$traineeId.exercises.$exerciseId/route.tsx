import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  Await,
  Form,
  Outlet,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import { type FC, Suspense, useEffect } from "react";
import { deleteAction } from "./delete-action";
import { DeleteExerciseButtonAndDialog } from "./delete-exercise-button-and-dialog";
import { EditExerciseButtonAndDialog } from "./edit-exercise-button-and-dialog";
import { ExerciseSummary } from "./exercise-summary";
import { updateAction } from "./update-action";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const user = getAuthenticator(context, request).isAuthenticated(request);
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeId = params["traineeId"]!;
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const exerciseId = params["exerciseId"]!;

  const data = Promise.all([
    getTagsByTraineeId(context)(traineeId),
    getExercisesWithTagsByTraineeId(context)(traineeId),
  ]);

  return {
    user,
    data,
    traineeId,
    exerciseId,
  };
};

const Controller: FC = () => {
  const { user, traineeId, exerciseId, data } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const Loading = (
    <Page
      traineeId={traineeId}
      exercise={undefined}
      registeredTags={undefined}
      registeredExercises={undefined}
    />
  );

  switch (navigation.state) {
    case "loading":
      return Loading;
    case "submitting":
      return Loading;
    case "idle":
      return (
        <Suspense fallback={Loading}>
          <Await resolve={user}>
            {(user) => {
              if (!user) {
                navigate("/login");
                return Loading;
              }

              if (traineeId !== user.id) {
                throw new Response("Not Found", { status: 404 });
              }

              return (
                <Await resolve={data}>
                  {([getTagsResult, getExercisesWithTagsResult]) => {
                    if (
                      getTagsResult.result !== "success" ||
                      getExercisesWithTagsResult.result !== "success"
                    ) {
                      throw new Response("Internal Server Error", {
                        status: 500,
                      });
                    }

                    const [registeredTags, registeredExercises] = [
                      getTagsResult.data,
                      getExercisesWithTagsResult.data,
                    ];

                    const exercise = registeredExercises.find(
                      (exercise) => exercise.id === exerciseId,
                    );

                    return (
                      <Page
                        traineeId={traineeId}
                        exercise={exercise}
                        registeredTags={registeredTags}
                        registeredExercises={registeredExercises}
                      />
                    );
                  }}
                </Await>
              );
            }}
          </Await>
        </Suspense>
      );
  }
};
export default Controller;

type Exercise = {
  id: string;
  name: string;
};
type Tag = {
  id: string;
  name: string;
};

type Props = {
  traineeId: string;
  exercise: (Exercise & { tags: Tag[] }) | undefined;
  registeredTags: Tag[] | undefined;
  registeredExercises: Exercise[] | undefined;
};
const Page: FC<Props> = ({
  traineeId,
  exercise,
  registeredTags,
  registeredExercises,
}) => {
  const actionData = useActionData<typeof action>();
  const { toast } = useToast();
  const navigate = useNavigate();

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

        return;
      }
      case "delete": {
        if (actionData.success) {
          toast({ title: "種目を削除しました" });
          navigate(`/trainees/${traineeId}/exercises`);
        } else {
          toast({ title: "種目の削除に失敗しました", variant: "destructive" });
        }

        return;
      }
    }
  }, [actionData, traineeId, navigate, toast]);

  return (
    <Main>
      <Section>
        <header className="flex justify-between">
          <ExerciseSummary traineeId={traineeId} exercise={exercise} />
          <div className="flex gap-2">
            <EditExerciseButtonAndDialog
              form={({ children, ...props }) => (
                <Form {...props} method="PUT">
                  {children}
                </Form>
              )}
              registeredTags={registeredTags}
              registeredExercises={registeredExercises}
              exercise={exercise}
            />
            <DeleteExerciseButtonAndDialog
              exercise={exercise}
              form={({ children, ...props }) => (
                <Form {...props} method="DELETE">
                  {children}
                </Form>
              )}
            />
          </div>
        </header>
      </Section>
      <Section>
        <Heading level={2}>トレーニング</Heading>
        <Outlet />
      </Section>
    </Main>
  );
};

export const action = async ({
  request,
  context,
  params,
}: ActionFunctionArgs) => {
  const [user, formData] = await Promise.all([
    getAuthenticator(context, request).isAuthenticated(request),
    request.formData(),
  ]);

  if (!user) {
    throw redirect("/login");
  }

  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeIdParam = params["traineeId"]!;

  switch (request.method) {
    case "PUT": {
      return updateAction({ formData, context, traineeId: traineeIdParam });
    }
    case "DELETE": {
      return deleteAction({ formData, context, traineeId: traineeIdParam });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
