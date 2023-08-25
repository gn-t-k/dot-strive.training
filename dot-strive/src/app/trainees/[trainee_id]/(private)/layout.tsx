import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Suspense } from "react";

import { GlobalNavigation } from "@/app/_components/global-navigation";
import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { container } from "styled-system/patterns";

import type { Layout } from "@/app/_types/layout";
import type { Route } from "next";
import type { FC } from "react";

const PrivateLayout: Layout = async ({ children, params }) => {
  return (
    <Suspense fallback={<p>認証情報を確認しています</p>}>
      <main className={container({ minH: "100dvh" })}>{children}</main>
      <GlobalNavigation />
      <RedirectByAuth traineeId={params?.["trainee_id"]} />
    </Suspense>
  );
};
export default PrivateLayout;

type Props = {
  traineeId: string | undefined;
};
const RedirectByAuth: FC<Props> = async (props) => {
  const session = await getServerSession(nextAuthOptions);
  const authUserId = session?.user.id;

  if (!authUserId) {
    redirect("/login" satisfies Route);
  }

  const trainee = await prisma.trainee.findUnique({
    where: {
      authUserId,
    },
  });

  if (!trainee) {
    redirect("/trainees/onboarding" satisfies Route);
  }

  if (!props.traineeId || props.traineeId !== trainee.id) {
    const to = `/trainees/${trainee.id}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return null;
};
