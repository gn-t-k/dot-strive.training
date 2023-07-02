"use client";

import { container } from "styled-system/patterns";

import type { PageError } from "@/app/_types/error";

const ErrorPage: PageError = ({ error, reset }) => {
  return (
    <main className={container()}>
      <h1>エラー</h1>
      <p>{error.message}</p>
      <button onClick={reset}>リセット</button>
    </main>
  );
};
export default ErrorPage;
