type GetHeaders = () => Promise<HeadersInit>;
export const getHeaders: GetHeaders = async () => {
  if (typeof window !== "undefined") {
    return {};
  }

  const { headers } = await import("next/headers");
  return Object.fromEntries(headers());
};
