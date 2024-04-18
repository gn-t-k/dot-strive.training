import { json, redirect } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useNavigation } from "@remix-run/react";

import { getAuthenticator } from "app/features/auth/get-authenticator.server";
import { validateTrainee } from "app/features/trainee/schema";

import { HeaderNavigation } from "./header-navigation";

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { FC } from "react";
import { TraineesRouteLoading } from "./trainees-route-loading";

export const loader = async ({
  context,
  request,
  params,
}: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context, request);
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    return redirect("/login");
  }

  if (params["traineeId"] !== user.id) {
    throw new Response("Not found.", { status: 404 });
  }

  const trainee = validateTrainee(user);
  if (!trainee) {
    throw new Response("Sorry, something went wrong.", { status: 500 });
  }

  return json({ trainee });
};

const PageWithNavigationHeader: FC = () => {
  const { trainee } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <>
      <header className="sticky top-0">
        <HeaderNavigation traineeId={trainee.id} />
      </header>
      {navigation.state === "idle" ? <Outlet /> : <TraineesRouteLoading />}
      <footer className="mt-8 flex h-24 items-center justify-center border-t px-4">
        <p className="text-muted-foreground">.STRIVE</p>
      </footer>
    </>
  );
};
export default PageWithNavigationHeader;
