import {
  array,
  brand,
  cuid2,
  minLength,
  object,
  pipe,
  safeParse,
  string,
} from "valibot";

import { tag } from "../tag/schema";

import type { InferOutput } from "valibot";

export const exercise = pipe(
  object({
    id: pipe(string(), cuid2("exercise cuid")),
    name: pipe(string(), minLength(1, "exercise name min length")),
    tags: array(tag),
  }),
  brand("exercise"),
);

export type Exercise = InferOutput<typeof exercise>;

type ValidateExercise = (input: unknown) => Exercise | undefined;
export const validateExercise: ValidateExercise = (input) => {
  const result = safeParse(exercise, input);

  return result.success ? result.output : undefined;
};
