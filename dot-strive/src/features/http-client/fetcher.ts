import { getBaseUrl } from "@/utils/get-base-url";

import { getHeaders } from "@/features/http-client/get-headers";

import type { Route } from "next";

export type Fetcher = <T extends string>(route: Route<T>) => Promise<Response>;

type GetFetcher = (init?: RequestInit) => Fetcher;
export const getFetcher: GetFetcher = (init) => async (route) => {
  const headers = await getHeaders();
  const response = await fetch(`${getBaseUrl()}${route}`, {
    method: "GET",
    ...init,
    headers: {
      ...init?.headers,
      ...headers,
    },
  });

  return response;
};
