import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "app/features/auth/get-authenticator.server";

/**
 * dot-strive.training/にアクセスした場合
 * - ログインしている場合はトレーニング一覧ページにリダイレクト
 * - ログインしていない場合はログインページにリダイレクト
 *
 * TODO: ここにLT置きたい
 */
export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const authenticator = getAuthenticator(context, request);
  const trainee = await authenticator.isAuthenticated(request);

  if (!trainee) {
    return redirect("/login");
  }

  return redirect(`/trainees/${trainee.id}/trainings`);
};
