import {
  brand,
  cuid2,
  minLength,
  object,
  pipe,
  safeParse,
  string,
} from "valibot";

import type { InferOutput } from "valibot";

export const tag = pipe(
  object({
    id: pipe(string(), cuid2("tag cuid")),
    name: pipe(string(), minLength(1, "tag name min length")),
  }),
  brand("tag"),
);

export type Tag = InferOutput<typeof tag>;

type ValidateTag = (input: unknown) => Tag | undefined;
export const validateTag: ValidateTag = (input) => {
  const result = safeParse(tag, input);

  return result.success ? result.output : undefined;
};
