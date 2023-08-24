import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { Layout } from "@/app/_types/layout";

import { getTraineeBySession } from "../[trainee_id]/(private)/_repositories/get-trainee-by-session";

import type { Route } from "next";

const Layout: Layout = async ({ children }) => {
  const session = await getServerSession(nextAuthOptions);
  const authUserId = session?.user.id;
  if (!authUserId) {
    redirect("/login" satisfies Route);
  }

  const getTraineeResult = await getTraineeBySession();

  if (getTraineeResult.isOk) {
    const trainee = getTraineeResult.value;
    const to = `/trainees/${trainee.id}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return <>{children}</>;
};
export default Layout;
