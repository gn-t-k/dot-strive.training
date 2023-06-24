import { getBaseUrl } from "@/utils/get-base-url";

import { getHeaders } from "@/features/http-client/get-headers";

import type { Route } from "next";

export type Mutator = <T extends string>(
  route: Route<T>,
  body?: BodyInit
) => Promise<Response>;

type GetMutator = (init?: RequestInit) => Mutator;
export const getMutator: GetMutator = (init) => async (route, body) => {
  const headers = await getHeaders();
  const response = await fetch(`${getBaseUrl()}${route}`, {
    ...init,
    method: init?.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      ...headers,
    },
    body,
  });

  return response;
};
