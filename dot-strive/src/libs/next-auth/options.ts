import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";

import client from "@/libs/prisma/client";

import { getEnv } from "@/utils/get-env";

import type { NextAuthOptions } from "next-auth";

export const nextAuthOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId: getEnv().GOOGLE_CLIENT_ID,
      clientSecret: getEnv().GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(client),
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
  secret: getEnv().NEXTAUTH_SECRET,
};
