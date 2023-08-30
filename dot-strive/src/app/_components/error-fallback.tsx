"use client";

import type { FC } from "react";
import type { FallbackProps } from "react-error-boundary";

export const ErrorFallback: FC<FallbackProps> = (props) => {
  return <p>{JSON.stringify(props.error)}</p>;
};
