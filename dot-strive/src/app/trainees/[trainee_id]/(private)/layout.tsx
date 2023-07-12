import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { GlobalNavigation } from "@/app/_components/global-navigation";
import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { container } from "styled-system/patterns";

import type { Layout } from "@/app/_types/layout";
import type { Route } from "next";

const PrivateLayout: Layout = async ({ children, params }) => {
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

  const traineeId = params?.["trainee_id"];

  if (!traineeId || traineeId !== trainee.id) {
    const to = `/trainees/${trainee.id}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <>
      <main className={container({ minH: "100dvh" })}>{children}</main>
      <GlobalNavigation />
    </>
  );
};
export default PrivateLayout;
