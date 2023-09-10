"use client";

import { useCookieState } from "ahooks";

import type { FC } from "react";

export const SetClientTimezoneOffset: FC = () => {
  const [cookie, setCookie] = useCookieState("client_timezone_offset");
  const timezoneOffsetString = String(new Date().getTimezoneOffset());
  if (!cookie || cookie !== timezoneOffsetString) {
    setCookie(timezoneOffsetString);
  }

  return null;
};
