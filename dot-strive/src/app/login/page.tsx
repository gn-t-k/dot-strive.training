import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Container, Heading } from "@/libs/chakra-ui";
import { nextAuthOptions } from "@/libs/next-auth/options";

import { LoginButton } from "@/features/auth/components/login-button";

import type { NextPage } from "../_utils/types";
import type { Route } from "next";

const Page: NextPage = async () => {
  const session = await getServerSession(nextAuthOptions);
  if (session) {
    redirect("/" satisfies Route);
  }

  return (
    <Container>
      <Heading>ログインページ</Heading>
      <LoginButton />
    </Container>
  );
};
export default Page;
