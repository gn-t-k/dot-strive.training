import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";

import { LoginButton } from "@/app/_components/login-button";
import { container } from "styled-system/patterns";

import type { NextPage } from "../_utils/types";
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
