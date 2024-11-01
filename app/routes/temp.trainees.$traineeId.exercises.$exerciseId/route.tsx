import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  Await,
  Form,
  Outlet,
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
import { type FC, Suspense } from "react";
import { EditExerciseButtonAndDialog } from "./edit-exercise-button-and-dialog";
import { ExerciseSummary } from "./exercise-summary";

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
  return (
    <Main>
      <Section>
        <header className="flex justify-between">
          <ExerciseSummary traineeId={traineeId} exercise={exercise} />
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
        </header>
      </Section>
      <Section>
        <Heading level={2}>トレーニング</Heading>
        <Outlet />
      </Section>
    </Main>
  );
};
