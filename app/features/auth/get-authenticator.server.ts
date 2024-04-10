import {
  type AppLoadContext,
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { type Input, object, string } from "valibot";
import { findTraineeByAuthUserId } from "../trainee/find-trainee-by-auth-user-id";
import { initializeTrainee } from "../trainee/initialize-trainee";

let authenticator: Authenticator<AuthUser>;
type AuthUser = Input<typeof authUserSchema>;
const authUserSchema = object({
  id: string(),
  name: string(),
  image: string(),
});

type GetAuthenticator = (
  context: AppLoadContext,
  request: Request,
) => Authenticator<AuthUser>;
export const getAuthenticator: GetAuthenticator = (context, request) => {
  if (authenticator) {
    return authenticator;
  }

  const { env } = context.cloudflare;

  const cookie = createCookie("__session", {
    secrets: [],
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30日間
    secure: process.env.NODE_ENV === "production",
  });
  const sessionStorage = createWorkersKVSessionStorage({
    kv: env.dot_strive_session_kv,
    cookie,
  });

  authenticator = new Authenticator<AuthUser>(sessionStorage);

  const { origin } = new URL(request.url);
  const googleStrategy = new GoogleStrategy<AuthUser>(
    {
      // biome-ignore lint/style/useNamingConvention: ライブラリに指定されているため
      clientID: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
      // biome-ignore lint/style/useNamingConvention: ライブラリに指定されているため
      callbackURL: `${origin}/auth/google/callback`,
    },
    async (user) => {
      const findTraineeResult = await findTraineeByAuthUserId(context)(
        user.profile.id,
      );

      switch (findTraineeResult.result) {
        case "find": {
          const trainee = findTraineeResult.data;
          return {
            id: trainee.id,
            name: trainee.name,
            image: trainee.image,
          };
        }
        case "not found": {
          const initializeTraineeResult = await initializeTrainee(context)({
            name: user.profile.displayName,
            image: user.profile.photos[0].value,
            authUserId: user.profile.id,
          });

          if (initializeTraineeResult.result !== "success") {
            throw new Error(initializeTraineeResult.error);
          }

          const trainee = initializeTraineeResult.data;
          return {
            id: trainee.id,
            name: trainee.name,
            image: trainee.image,
          };
        }
        case "failure": {
          throw new Error(findTraineeResult.error);
        }
      }
    },
  );

  authenticator.use(googleStrategy);

  return authenticator;
};
