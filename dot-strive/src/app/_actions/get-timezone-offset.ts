"use server";

import { cookies } from "next/headers";

type GetTimezoneOffset = () => number;
export const getTimezoneOffset: GetTimezoneOffset = () => {
  const clientTimezoneOffsetCookie = cookies().get("client_timezone_offset");
  const clientTimezoneOffset = ((): number => {
    const number = Number(clientTimezoneOffsetCookie?.value);

    return isNaN(number) ? 0 : number;
  })();
  const serverTimezoneOffset = new Date().getTimezoneOffset();
  const timezoneOffset = clientTimezoneOffset - serverTimezoneOffset;

  return timezoneOffset;
};
