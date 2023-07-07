import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginButton } from "@/app/_components/login-button";
import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { container } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async () => {
  const session = await getServerSession(nextAuthOptions);
  if (session) {
    redirect("/" satisfies Route);
  }

  return (
    <main className={container()}>
      <h1>ログインページ</h1>
      <LoginButton />
    </main>
  );
};
export default Page;
