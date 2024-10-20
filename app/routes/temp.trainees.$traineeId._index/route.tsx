import { redirect } from "@remix-run/cloudflare";
import {
  Await,
  Form,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {} from "app/ui/alert-dialog";
import { type FC, Suspense } from "react";
import { TraineeInfo } from "./trainee-info";

import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { deleteTrainee } from "app/features/trainee/delete-trainee";
import { action as logoutAction } from "app/routes/auth.logout/route";
import { DeleteAccountButtonAndDialog } from "./delete-account-button-and-dialog";
import { LogoutButton } from "./logout-button";

export const loader = ({ context, request, params }: LoaderFunctionArgs) => {
  const user = getAuthenticator(context, request).isAuthenticated(request);

  return {
    user,
    // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
    traineeIdParam: params["traineeId"]!,
  };
};

const Controller: FC = () => {
  const { user, traineeIdParam } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  switch (navigation.state) {
    case "loading":
      return <Page trainee={undefined} />;
    case "submitting":
      return <Page trainee={undefined} />;
    case "idle":
      return (
        <Suspense fallback={<Page trainee={undefined} />}>
          <Await resolve={user}>
            {(user) => {
              if (!user) {
                navigate("/login");
                return <Page trainee={undefined} />;
              }

              const { id, name, image } = user;
              if (traineeIdParam !== id) {
                throw new Response("Not found.", { status: 404 });
              }

              return <Page trainee={{ id, name, image }} />;
            }}
          </Await>
        </Suspense>
      );
  }
};
export default Controller;

type PageProps = {
  trainee:
    | {
        id: string;
        name: string;
        image: string;
      }
    | undefined;
};
const Page: FC<PageProps> = ({ trainee }) => {
  return (
    <Main>
      <Section className="mt-4 items-center">
        <TraineeInfo trainee={trainee} />
        <LogoutButton
          form={({ children }) => (
            <Form method="DELETE" action="/auth/logout" className="w-full">
              {children}
            </Form>
          )}
        />
        <DeleteAccountButtonAndDialog
          form={({ children }) => <Form method="post">{children}</Form>}
        />
      </Section>
    </Main>
  );
};

export const action = async ({
  params,
  request,
  context,
}: ActionFunctionArgs) => {
  const user = await getAuthenticator(context, request).isAuthenticated(
    request,
  );

  if (!user) {
    throw redirect("/login");
  }

  // biome-ignore lint/style/noNonNullAssertion: Remixが保証してくれてる
  const traineeIdParam = params["traineeId"]!;

  switch (request.method) {
    case "DELETE": {
      if (traineeIdParam !== user.id) {
        throw new Response("Bad Request", { status: 400 });
      }

      const result = await deleteTrainee(context)({ id: traineeIdParam });

      if (!result.success) {
        return null;
      }

      return await logoutAction({ params, request, context });
    }
    default: {
      throw new Response("Bad Request", { status: 400 });
    }
  }
};
