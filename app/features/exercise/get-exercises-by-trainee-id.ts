import { desc, eq } from "drizzle-orm";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises as exercisesSchema } from "database/tables/exercises";
import { drizzle } from "drizzle-orm/d1";

type GetExercisesByTraineeId = (
  context: AppLoadContext,
) => (
  traineeId: string,
) => Promise<
  | { result: "success"; data: { id: string; name: string }[] }
  | { result: "failure" }
>;
export const getExercisesByTraineeId: GetExercisesByTraineeId =
  (context) => async (traineeId) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({ id: exercisesSchema.id, name: exercisesSchema.name })
        .from(exercisesSchema)
        .where(eq(exercisesSchema.traineeId, traineeId))
        .orderBy(desc(exercisesSchema.createdAt));

      return { result: "success", data };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
