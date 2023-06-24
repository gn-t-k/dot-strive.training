import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import prisma from "@/libs/prisma/client";

import type { NextPage } from "./_types/page";
import type { Route } from "next";
import { Stack, Text } from "@/libs/chakra-ui";
import { LogoutButton } from "@/features/auth/logout-button";
import { LoginButton } from "@/features/auth/login-button";

const Page: NextPage = async () => {
  const session = await getServerSession(nextAuthOptions);

  return session ? (
    <Stack direction="column">
      <Text>welcome {session.user?.name}</Text>
      <LogoutButton />
    </Stack>
  ) : (
    <Stack direction="column">
      <Text>welcome guest</Text>
      <LoginButton />
    </Stack>
  );
};
export default Page;
