import type { FC } from "react";

// https://nextjs.org/docs/app/api-reference/file-conventions/page
export type NextPage = FC<{
  params?: {
    [key: string]: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}>;
