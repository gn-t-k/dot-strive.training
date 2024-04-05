import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context, request);
  const trainee = await authenticator.isAuthenticated(request);

  if (!trainee) {
    return redirect("/login");
  }

  return redirect(`/trainees/${trainee.id}/trainings`);
};
