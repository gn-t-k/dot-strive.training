import { err, ok } from "neverthrow";
import { z } from "zod";

import type { Result } from "neverthrow";

export const traineeIdSchema = z.string().brand("trainee-id");
const traineeSchema = z.object({
  id: traineeIdSchema,
  name: z.string(),
  image: z.string().url(),
});
export type Trainee = z.infer<typeof traineeSchema>;
export type TraineeId = z.infer<typeof traineeIdSchema>;

type UnvalidatedTrainee = {
  id: string;
  name: string;
  image: string;
};
export const validateTrainee = (
  data: UnvalidatedTrainee
): Result<Trainee, Error> => {
  const result = traineeSchema.safeParse(data);

  return result.success ? ok(result.data) : err(new Error("validation error"));
};
