export const getBaseUrl = (): string => {
  return typeof window !== "undefined"
    ? window.location.origin
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT}`;
};
