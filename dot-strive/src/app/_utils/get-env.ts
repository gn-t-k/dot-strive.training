const keys = {
  googleClientId: "GOOGLE_CLIENT_ID",
  googleClientSecret: "GOOGLE_CLIENT_SECRET",
  nextAuthSecret: "NEXTAUTH_SECRET",
} as const;
type Key = typeof keys[keyof typeof keys];

type GetEnv = () => { [key in Key]: string };
export const getEnv: GetEnv = () => ({
  GOOGLE_CLIENT_ID: unwrap(process.env.GOOGLE_CLIENT_ID, keys.googleClientId),
  GOOGLE_CLIENT_SECRET: unwrap(
    process.env.GOOGLE_CLIENT_SECRET,
    keys.googleClientSecret
  ),
  NEXTAUTH_SECRET: unwrap(process.env.NEXTAUTH_SECRET, keys.nextAuthSecret),
});

type Unwrap = (value: Value, key: Key) => string;
type Value = typeof process.env[string];
const unwrap: Unwrap = (value, key) => {
  if (!value) {
    throw new Error(`環境変数"${key}"が設定されていません`);
  }

  return value;
};
