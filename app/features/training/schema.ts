import {
  array,
  brand,
  cuid2,
  date,
  maxValue,
  minValue,
  number,
  object,
  safeParse,
  string,
} from "valibot";

import { exercise } from "../exercise/schema";

import { type InferOutput, pipe } from "valibot";

export const training = pipe(
  object({
    id: pipe(string(), cuid2("training cuid")),
    date: date("training date"),
    sessions: array(
      object({
        exercise: exercise,
        memo: string("training memo"),
        sets: array(
          object({
            weight: pipe(number(), minValue(0, "weight min value")),
            reps: pipe(number(), minValue(0, "reps min value")),
            rpe: pipe(
              number(),
              minValue(0, "rpe min value"),
              maxValue(10, "rpe max value"),
            ),
          }),
        ),
      }),
    ),
  }),
  brand("training"),
);

export type Training = InferOutput<typeof training>;

type ValidateTraining = (input: unknown) => Training | undefined;
export const validateTraining: ValidateTraining = (input) => {
  const result = safeParse(training, input);

  return result.success ? result.output : undefined;
};
