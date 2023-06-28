import { NextAuthProvider } from "@/app/_libs/next-auth/provider";
import "./global.css";

import type { Layout } from "@/app/_types/layout";

const RootLayout: Layout = ({ children }) => {
  return (
    <html lang="ja">
      <body>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
};
export default RootLayout;
