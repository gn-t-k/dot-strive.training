import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LogoutButton } from "@/app/_components/logout-button";
import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { container } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
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
