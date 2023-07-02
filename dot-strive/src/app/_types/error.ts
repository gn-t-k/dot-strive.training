import type { ReactElement } from "react";

// https://nextjs.org/docs/app/api-reference/file-conventions/error
export type PageError = (props: {
  error: Error;
  reset: () => void;
}) => ReactElement;
