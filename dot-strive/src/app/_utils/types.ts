import type { FC, PropsWithChildren } from "react";

// https://nextjs.org/docs/app/api-reference/file-conventions/page
export type NextPage = FC<{
  params?: {
    [key: string]: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}>;

// https://nextjs.org/docs/app/api-reference/file-conventions/layout
export type Layout = FC<
  PropsWithChildren<{
    params?: {
      [key: string]: string;
    };
  }>
>;
