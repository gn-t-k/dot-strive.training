import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { FC, PropsWithChildren } from "react";

import "./globals.css";

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TODO: はずす */}
        <meta name="robots" content="noindex" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="mx-auto max-w-sm">
          {/* モバイル画面のみ開発する */}
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};

const App: FC = () => {
  return <Outlet />;
};
export default App;
