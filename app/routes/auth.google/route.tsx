import { redirect } from "@remix-run/cloudflare";

import { getAuthenticator } from "app/features/auth/get-authenticator.server";

import type { ActionFunction, LoaderFunction } from "@remix-run/cloudflare";

export const loader: LoaderFunction = () => redirect("/login");

export const action: ActionFunction = ({ request, context }) => {
  const { origin } = new URL(request.url);
  const authenticator = getAuthenticator(context, origin);

  return authenticator.authenticate("google", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
