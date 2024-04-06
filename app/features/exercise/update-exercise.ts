import { eq } from "drizzle-orm";

import { exercises as exercisesSchema } from "database/tables/exercises";
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from "database/tables/muscle-exercise-mappings";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Exercise } from "./schema";

type UpdateExercise = (
  context: AppLoadContext,
) => (
  props: Exercise,
) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const updateExercise: UpdateExercise =
  (context) =>
  async ({ id, name, targets }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const [[updated]] = await database.batch([
        database
          .update(exercisesSchema)
          .set({
            name,
            updatedAt: new Date(),
          })
          .where(eq(exercisesSchema.id, id))
          .returning({ id: exercisesSchema.id, name: exercisesSchema.name }),
        database
          .delete(muscleExerciseMappingsSchema)
          .where(eq(muscleExerciseMappingsSchema.exerciseId, id)),
        database
          .insert(muscleExerciseMappingsSchema)
          .values(
            targets.map((target) => ({ exerciseId: id, muscleId: target.id })),
          ),
      ]);

      return updated
        ? { result: "success", data: updated }
        : { result: "failure" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
