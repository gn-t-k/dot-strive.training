import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { getLoadContext } from "./load-context";

// nativeFetch: true が必要
// https://github.com/remix-run/remix/issues/9324
installGlobals({
  nativeFetch: true,
});

export default defineConfig({
  plugins: [
    remixCloudflareDevProxy({ getLoadContext }),
    remix({
      future: {
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        unstable_singleFetch: true,
      },
    }),
    tsconfigPaths(),
  ],
});
