import { z } from "zod";

import { err, ok } from "../_utils/result";

import type { Result } from "../_utils/result";

const muscleIdSchema = z.string().brand("muscle-id");
export const muscleSchema = z.object({
  id: muscleIdSchema,
  name: z.string().min(1),
});
export type Muscle = z.infer<typeof muscleSchema>;
export type MuscleId = z.infer<typeof muscleIdSchema>;

export type UnvalidatedMuscle = {
  id: string;
  name: string;
};
export const validateMuscle = (
  data: UnvalidatedMuscle
): Result<Muscle, Error> => {
  const result = muscleSchema.safeParse(data);

  return result.success ? ok(result.data) : err(new Error("validation error"));
};
