"use client";

import { signIn } from "next-auth/react";

import { getBaseUrl } from "@/utils/get-base-url";

import type { Route } from "next";
import type { FC, MouseEventHandler } from "react";

export const LoginButton: FC = () => {
  const onClick: MouseEventHandler<HTMLButtonElement> = async (_) => {
    await signIn("google", {
      callbackUrl: `${getBaseUrl()}${"/" satisfies Route}`,
    });
  };

  return <button onClick={onClick}>ログイン</button>;
};
