import { redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";

import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { Button } from "app/ui/button";
import { Logotype } from "app/ui/logotype";
import { Main } from "app/ui/main";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { FC } from "react";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context, request);
  const trainee = await authenticator.isAuthenticated(request);

  if (trainee) {
    throw redirect(`/trainees/${trainee.id}/trainings`);
  }

  return null;
};

const Page: FC = () => {
  return (
    <Main className="h-screen items-center justify-center">
      <Logotype />
      <Form method="POST" action="/auth/google">
        <Button>Googleアカウントでログインする</Button>
      </Form>
    </Main>
  );
};
export default Page;
