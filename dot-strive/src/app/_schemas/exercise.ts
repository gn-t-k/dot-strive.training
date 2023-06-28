import { ok, err } from "neverthrow";
import { z } from "zod";

import { muscleSchema } from "@/app/_schemas/muscle";

import type { Muscle } from "./muscle";
import type { Result } from "neverthrow";

const exerciseIdSchema = z.string().brand("exercise-id");
const exerciseSchema = z.object({
  id: exerciseIdSchema,
  name: z.string().min(1),
  targets: z.array(muscleSchema),
});
export type Exercise = z.infer<typeof exerciseSchema>;
export type ExerciseId = z.infer<typeof exerciseIdSchema>;

type UnvalidatedExercise = {
  id: string;
  name: string;
  targets: Muscle[];
};
export const validateExercise = (
  data: UnvalidatedExercise
): Result<Exercise, Error> => {
  const result = exerciseSchema.safeParse(data);

  return result.success ? ok(result.data) : err(new Error("validation error"));
};
