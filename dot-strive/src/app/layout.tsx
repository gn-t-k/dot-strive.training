import { ChakraUIProvider } from "@/libs/chakra-ui/provider";
import { NextAuthProvider } from "@/libs/next-auth/provider";
import "./global.css";

import type { Layout } from "./_utils/types";

const RootLayout: Layout = ({ children }) => {
  return (
    <html lang="ja">
      <body>
        <NextAuthProvider>
          <ChakraUIProvider>{children}</ChakraUIProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
};
export default RootLayout;
