import { z } from "zod";

import { exerciseSchema } from "./exercise";
import { utcDateStringSchema } from "./utc-date-string";
import { err, ok } from "../_utils/result";

import type { UnvalidatedExercise } from "./exercise";
import type { Result } from "../_utils/result";

const setIdSchema = z.string().brand("set-id");
export const setSchema = z.object({
  id: setIdSchema,
  weight: z.number().nonnegative(),
  repetition: z.number().int().nonnegative(),
  estimatedMaximumWeight: z.number().int().nonnegative(),
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
export type Set = z.infer<typeof setSchema>;

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

type GetEstimatedMaximumWeight = (props: {
  weight: number;
  repetition: number;
}) => number;
export const getEstimatedMaximumWeight: GetEstimatedMaximumWeight = (set) => {
  const { weight, repetition } = set;

  if (repetition < 1) {
    return 0;
  }

  // 1回から12回の場合
  const coefficients = [
    1, 0.95, 0.93, 0.9, 0.87, 0.85, 0.83, 0.8, 0.77, 0.75, 0.7, 0.67,
  ] as const;
  if (1 <= repetition && repetition <= 12) {
    const coefficient = coefficients[repetition - 1] ?? 1;
    return Math.round(weight / coefficient);
  }

  // 13回以上の場合
  return Math.round(
    (100 * weight) / (48.8 + 53.8 * Math.pow(Math.E, -0.075 * repetition))
  );
};

type GetVolume = (training: Training) => number;
export const getVolume: GetVolume = (training) => {
  return training.records
    .flatMap((record) => record.sets)
    .reduce((total, set) => {
      return total + set.weight * set.repetition;
    }, 0);
};
