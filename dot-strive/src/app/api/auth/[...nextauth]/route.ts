import NextAuth from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";

const handler = NextAuth(nextAuthOptions);

// https://next-auth.js.org/configuration/initialization#route-handlers-app
export { handler as GET, handler as POST };
