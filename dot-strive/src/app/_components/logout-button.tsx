"use client";

import { signOut } from "next-auth/react";

import { getBaseUrl } from "@/utils/get-base-url";

import { Button } from "./button";

import type { Route } from "next";
import type { FC, MouseEventHandler } from "react";

export const LogoutButton: FC = () => {
  const onClick: MouseEventHandler<HTMLButtonElement> = async (_) => {
    await signOut({
      callbackUrl: `${getBaseUrl()}${"/login" satisfies Route}`,
    });
  };

  return <Button onClick={onClick}>ログアウト</Button>;
};
