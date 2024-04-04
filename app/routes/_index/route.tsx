import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/cloudflare";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { origin } = new URL(request.url);
  const authenticator = getAuthenticator(context, origin);
  const trainee = await authenticator.isAuthenticated(request);

  if (!trainee) {
    return redirect("/login");
  }

  return redirect(`/trainees/${trainee.id}/trainings`);
};
