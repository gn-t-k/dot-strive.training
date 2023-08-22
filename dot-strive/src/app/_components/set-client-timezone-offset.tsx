"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Route } from "next";
import type { FC } from "react";

export const SetClientTimezoneOffset: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramName = "client_timezone_offset";

  const timezoneOffset = searchParams.get(paramName);

  if (!timezoneOffset || isNaN(Number(timezoneOffset))) {
    const timezoneOffset = new Date().getTimezoneOffset();
    const params = new URLSearchParams(Array.from(searchParams.entries()));

    params.set(paramName, String(timezoneOffset));

    router.replace(`${pathname}?${params.toString()}` as Route);
  }

  return null;
};
