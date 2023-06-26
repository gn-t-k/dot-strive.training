import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import { prisma } from "@/libs/prisma/client";

import { LogoutButton } from "@/app/_components/logout-button";
import { container } from "styled-system/patterns";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = async () => {
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
  if (trainee !== null) {
    const to = `/trainees/${trainee.id}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <main className={container()}>
      <h1>オンボーディング</h1>
      <LogoutButton />
    </main>
  );
};
export default Page;
