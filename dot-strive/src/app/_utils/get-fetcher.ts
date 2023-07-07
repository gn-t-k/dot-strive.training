import { getBaseUrl } from "@/app/_utils/get-base-url";

import type { Route } from "next";

type GetFetcher = (
  init?: RequestInit
) => <T extends string>(route: Route<T>, body?: BodyInit) => Promise<Response>;
export const getFetcher: GetFetcher = (init) => async (route, body) => {
  const headers = await getHeaders();
  const response = await fetch(`${getBaseUrl()}${route}`, {
    method: "GET",
    ...init,
    headers: {
      ...init?.headers,
      ...headers,
    },
    body,
  });

  return response;
};

type GetHeaders = () => Promise<HeadersInit>;
export const getHeaders: GetHeaders = async () => {
  if (typeof window !== "undefined") {
    return {};
  }

  const { headers } = await import("next/headers");
  return Object.fromEntries(headers());
};
