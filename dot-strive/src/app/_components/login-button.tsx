"use client";

import { signIn } from "next-auth/react";

import { getBaseUrl } from "@/app/_utils/get-base-url";

import { Button } from "./button";

import type { Route } from "next";
import type { FC, MouseEventHandler } from "react";

export const LoginButton: FC = () => {
  const onClick: MouseEventHandler<HTMLButtonElement> = async (_) => {
    await signIn("google", {
      callbackUrl: `${getBaseUrl()}${"/" satisfies Route}`,
    });
  };

  return <Button onClick={onClick}>ログイン</Button>;
};
