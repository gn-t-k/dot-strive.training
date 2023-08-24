import { z } from "zod";

import { exerciseSchema } from "./exercise";
import { utcDateStringSchema } from "./utc-date-string";
import { err, ok } from "../_utils/result";

import type { UnvalidatedExercise } from "./exercise";
import type { Result } from "../_utils/result";

const setIdSchema = z.string().brand("set-id");
const setSchema = z.object({
  id: setIdSchema,
  weight: z.number().nonnegative(),
  repetition: z.number().int().nonnegative(),
  order: z.number().int().nonnegative(),
});
const recordIdSchema = z.string().brand("record-id");
const recordSchema = z.object({
  id: recordIdSchema,
  exercise: exerciseSchema,
  sets: z.array(setSchema),
  memo: z.string(),
  order: z.number().int().nonnegative(),
});
const trainingIdSchema = z.string().brand("training-id");
const trainingSchema = z.object({
  id: trainingIdSchema,
  records: z.array(recordSchema),
  date: utcDateStringSchema,
});
export type Training = z.infer<typeof trainingSchema>;
export type Record = z.infer<typeof recordSchema>;

type UnvalidatedTraining = {
  id: string;
  records: UnvalidatedRecord[];
  date: string;
};
type UnvalidatedRecord = {
  id: string;
  exercise: UnvalidatedExercise;
  sets: UnvalidatedSet[];
  memo: string;
  order: number;
};
type UnvalidatedSet = {
  id: string;
  weight: number;
  repetition: number;
  order: number;
};
export const validateTraining = (
  data: UnvalidatedTraining
): Result<Training, Error> => {
  const result = trainingSchema.safeParse(data);

  return result.success
    ? ok(result.data)
    : err(new Error(`validation error: ${result.error}`));
};
