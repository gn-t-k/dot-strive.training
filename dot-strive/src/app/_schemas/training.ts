import { err, ok } from "neverthrow";
import { z } from "zod";

import { exerciseSchema } from "./exercise";

import type { UnvalidatedExercise } from "./exercise";
import type { Result } from "neverthrow";

const setIdSchema = z.string().brand("set-id");
const setSchema = z.object({
  id: setIdSchema,
  weight: z.number().positive(),
  repetition: z.number().positive().int(),
});
const recordIdSchema = z.string().brand("record-id");
const recordSchema = z.object({
  id: recordIdSchema,
  exercise: exerciseSchema,
  sets: z.array(setSchema),
  memo: z.string(),
});
const trainingIdSchema = z.string().brand("training-id");
const trainingSchema = z.object({
  id: trainingIdSchema,
  records: z.array(recordSchema),
  date: z
    .string()
    .datetime()
    .refine((dateString) => isUTC(dateString), {
      message: "date must be a UTC date string",
      path: ["date"],
    }),
});
const isUTC = (date: string): boolean => {
  return (
    date.endsWith("Z") || date.includes("+00:00") || date.includes("-00:00")
  );
};
export type Training = z.infer<typeof trainingSchema>;

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
};
type UnvalidatedSet = {
  id: string;
  weight: number;
  repetition: number;
};
export const validateTraining = (
  data: UnvalidatedTraining
): Result<Training, Error> => {
  const result = trainingSchema.safeParse(data);

  return result.success
    ? ok(result.data)
    : err(new Error(`validation error: ${result.error}`));
};
