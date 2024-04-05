import { createId } from "@paralleldrive/cuid2";
import {
  type AppLoadContext,
  createCookie,
  createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";
import { trainees } from "database/tables/trainees";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { type Input, object, string } from "valibot";

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
      const database = drizzle(context.cloudflare.env.DB);
      const [trainee] = await database
        .select()
        .from(trainees)
        .where(eq(trainees.authUserId, user.profile.id));

      if (trainee) {
        return {
          id: trainee.id,
          name: trainee.name,
          image: trainee.image,
        };
      }

      const newTrainee = await database
        .insert(trainees)
        .values({
          id: createId(),
          name: user.profile.displayName,
          image: user.profile.photos[0].value,
          authUserId: user.profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .get();

      return {
        id: newTrainee.id,
        name: newTrainee.name,
        image: newTrainee.image,
      };
    },
  );

  authenticator.use(googleStrategy);

  return authenticator;
};
