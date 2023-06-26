"use client";

import { signOut } from "next-auth/react";

import { getBaseUrl } from "@/utils/get-base-url";

import type { Route } from "next";
import type { FC, MouseEventHandler } from "react";

export const LogoutButton: FC = () => {
  const onClick: MouseEventHandler<HTMLButtonElement> = async (_) => {
    await signOut({
      callbackUrl: `${getBaseUrl()}${"/login" satisfies Route}`,
    });
  };

  return <button onClick={onClick}>ログアウト</button>;
};
