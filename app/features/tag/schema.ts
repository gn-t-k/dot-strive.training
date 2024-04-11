import { brand, cuid2, minLength, object, safeParse, string } from "valibot";

import type { Output } from "valibot";

export const tag = brand(
  object({
    id: string([cuid2("tag cuid")]),
    name: string([minLength(1, "tag name min length")]),
  }),
  "tag",
);

export type Tag = Output<typeof tag>;

type ValidateTag = (input: unknown) => Tag | undefined;
export const validateTag: ValidateTag = (input) => {
  const result = safeParse(tag, input);

  return result.success ? result.output : undefined;
};
