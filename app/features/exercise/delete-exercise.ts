import { eq } from "drizzle-orm";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises as exercisesSchema } from "database/tables/exercises";
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from "database/tables/muscle-exercise-mappings";
import { drizzle } from "drizzle-orm/d1";

type DeleteExercise = (
  context: AppLoadContext,
) => (props: { id: string }) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const deleteExercise: DeleteExercise =
  (context) =>
  async ({ id }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const [_, [deleted]] = await database.batch([
        database
          .delete(muscleExerciseMappingsSchema)
          .where(eq(muscleExerciseMappingsSchema.exerciseId, id)),
        database
          .delete(exercisesSchema)
          .where(eq(exercisesSchema.id, id))
          .returning({ id: exercisesSchema.id, name: exercisesSchema.name }),
      ]);

      return deleted
        ? { result: "success", data: deleted }
        : { result: "failure" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
