import { redirect } from "@remix-run/cloudflare";

import { getAuthenticator } from "app/features/auth/get-authenticator.server";

import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export const loader = () => redirect("/login");

export const action = ({ request, context }: ActionFunctionArgs) => {
  const { origin } = new URL(request.url);
  const authenticator = getAuthenticator(context, origin);

  return authenticator.logout(request, {
    redirectTo: "/login",
  });
};
