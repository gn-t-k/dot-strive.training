import { NextAuthProvider } from "@/app/_libs/next-auth/provider";
import "./global.css";

import { ToastProvider } from "./_hooks/use-toast";

import type { Layout } from "@/app/_types/layout";

const RootLayout: Layout = ({ children }) => {
  return (
    <html lang="ja">
      <body>
        <NextAuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
};
export default RootLayout;
