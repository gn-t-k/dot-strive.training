import {
  url,
  brand,
  cuid2,
  minLength,
  object,
  pipe,
  safeParse,
  string,
} from "valibot";

import type { InferInput, InferOutput } from "valibot";

const schema = object({
  id: pipe(string(), cuid2()),
  name: pipe(string(), minLength(1)),
  image: pipe(string(), url()),
});
const branded = pipe(schema, brand("trainee"));

export type Trainee = InferOutput<typeof branded>;

type ValidateTrainee = (
  input: InferInput<typeof schema>,
) => Trainee | undefined;
export const validateTrainee: ValidateTrainee = (input) => {
  const result = safeParse(branded, input);

  return result.success ? result.output : undefined;
};
