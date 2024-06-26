import { exercises as exercisesSchema } from "database/tables/exercises";
import { tagExerciseMappings } from "database/tables/tag-exercise-mappings";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Exercise } from "./schema";

type CreateExercise = (context: AppLoadContext) => (props: {
  exercise: Exercise;
  traineeId: string;
}) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const createExercise: CreateExercise =
  (context) =>
  async ({ exercise, traineeId }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const [[created]] = await database.batch([
        database
          .insert(exercisesSchema)
          .values({
            id: exercise.id,
            name: exercise.name,
            traineeId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({ id: exercisesSchema.id, name: exercisesSchema.name }),
        database
          .insert(tagExerciseMappings)
          .values(
            exercise.tags.map((tag) => ({
              exerciseId: exercise.id,
              tagId: tag.id,
            })),
          )
          .onConflictDoNothing(),
      ]);

      return created
        ? { result: "success", data: created }
        : { result: "failure" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
