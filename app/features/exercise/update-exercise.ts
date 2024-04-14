import { eq } from "drizzle-orm";

import { exercises as exercisesSchema } from "database/tables/exercises";
import { tagExerciseMappings as tagExerciseMappingsSchema } from "database/tables/tag-exercise-mappings";

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
  async ({ id, name, tags }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
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
          .delete(tagExerciseMappingsSchema)
          .where(eq(tagExerciseMappingsSchema.exerciseId, id)),
        database
          .insert(tagExerciseMappingsSchema)
          .values(tags.map((tag) => ({ exerciseId: id, tagId: tag.id }))),
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
