import { redirect } from "@remix-run/cloudflare";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { Heading } from "app/ui/heading";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { useToast } from "app/ui/use-toast";
import { Suspense, useEffect } from "react";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import type { FC } from "react";
import { createAction } from "./create-action";
import { PageSummary } from "./page-summary";
import { RegisterExercisesButtonAndDialog } from "./register-exercises-button-and-dialog";
import { RegisteredExerciseList } from "./registered-exercise-list";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const user = getAuthenticator(context, request).isAuthenticated(request);
  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeIdParam = params["traineeId"]!;

  const data = Promise.all([
    getTagsByTraineeId(context)(traineeIdParam),
    getExercisesWithTagsByTraineeId(context)(traineeIdParam),
  ]);

  return {
    user,
    traineeIdParam,
    data,
  };
};

const Controller: FC = () => {
  const { user, traineeIdParam, data } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const Loading = (
    <Page traineeId={traineeIdParam} tags={undefined} exercises={undefined} />
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

              if (traineeIdParam !== user.id) {
                throw new Response("Not found.", { status: 404 });
              }

              return (
                <Await resolve={data}>
                  {([getTagsResult, getExercisesResult]) => {
                    if (
                      getTagsResult.result !== "success" ||
                      getExercisesResult.result !== "success"
                    ) {
                      throw new Response("Internal Server Error", {
                        status: 500,
                      });
                    }

                    return (
                      <Page
                        traineeId={traineeIdParam}
                        tags={getTagsResult.data}
                        exercises={getExercisesResult.data}
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

type PageProps = {
  traineeId: string;
  tags: Tag[] | undefined;
  exercises: Exercise[] | undefined;
};
type Tag = { id: string; name: string };
type Exercise = { id: string; name: string; tags: Tag[] };
const Page: FC<PageProps> = ({ traineeId, tags, exercises }) => {
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
    <Main>
      <PageSummary />
      <Section>
        <RegisterExercisesButtonAndDialog
          form={({ children }) => <Form method="POST">{children}</Form>}
          registeredTags={tags}
          registeredExercises={exercises}
        />
      </Section>
      <Section>
        <Heading level={2}>登録されている種目</Heading>
        <RegisteredExerciseList traineeId={traineeId} exercises={exercises} />
      </Section>
    </Main>
  );
};

export const action = async ({
  params,
  request,
  context,
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
    case "POST": {
      if (traineeIdParam !== user.id) {
        throw new Response("Bad Request", { status: 400 });
      }

      return createAction({ formData, context, traineeId: traineeIdParam });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
