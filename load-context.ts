import type { PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare & {
      /**
       * wrangler.tomlに追加できる環境変数は追加して`bun run typegen`する
       * wrangler.tomlに追加できない環境変数は.dev.varとダッシュボードで設定して、ここで型定義する
       */
      env: Cloudflare["env"] & {
        // biome-ignore lint/style/useNamingConvention: 環境変数はコンスタントケース
        SESSION_SECRET: string;
        // biome-ignore lint/style/useNamingConvention: 環境変数はコンスタントケース
        GOOGLE_AUTH_CLIENT_ID: string;
        // biome-ignore lint/style/useNamingConvention: 環境変数はコンスタントケース
        GOOGLE_AUTH_CLIENT_SECRET: string;
      };
    };
  }
}
