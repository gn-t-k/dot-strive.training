import { desc, eq, sql } from "drizzle-orm";
import {
  array,
  cuid2,
  merge,
  minLength,
  object,
  safeParse,
  string,
} from "valibot";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises } from "database/tables/exercises";
import { tagExerciseMappings } from "database/tables/tag-exercise-mappings";
import { tags as tagsSchema } from "database/tables/tags";
import { drizzle } from "drizzle-orm/d1";
import type { Input } from "valibot";

type GetExercisesWithTagsByTraineeId = (
  context: AppLoadContext,
) => (
  traineeId: string,
) => Promise<{ result: "success"; data: Payload } | { result: "failure" }>;
type Payload = Input<typeof payloadSchema>;
const tagSchema = object({
  id: string([cuid2()]),
  name: string([minLength(1)]),
});
const exerciseSchema = object({
  id: string([cuid2()]),
  name: string([minLength(1)]),
});
const payloadSchema = array(
  merge([
    exerciseSchema,
    object({
      tags: array(tagSchema),
    }),
  ]),
);
export const getExercisesWithTagsByTraineeId: GetExercisesWithTagsByTraineeId =
  (context) => async (traineeId) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({
          exerciseId: sql`${exercises.id}`.as("exerciseId"),
          exerciseName: sql`${exercises.name}`.as("exerciseName"),
          tagId: sql`${tagsSchema.id}`.as("tagId"),
          tagName: sql`${tagsSchema.name}`.as("tagName"),
        })
        .from(exercises)
        .leftJoin(
          tagExerciseMappings,
          eq(exercises.id, tagExerciseMappings.exerciseId),
        )
        .leftJoin(tagsSchema, eq(tagExerciseMappings.tagId, tagsSchema.id))
        .where(eq(exercises.traineeId, traineeId))
        .orderBy(desc(exercises.createdAt));

      const payload = data.reduce<Payload>(
        (accumulator, { exerciseId, exerciseName, tagId, tagName }) => {
          const [parseTagResult, parseExerciseResult] = [
            safeParse(tagSchema, { id: tagId, name: tagName }),
            safeParse(exerciseSchema, { id: exerciseId, name: exerciseName }),
          ];
          if (!(parseTagResult.success && parseExerciseResult.success)) {
            return accumulator;
          }
          const [exercise, tag] = [
            parseExerciseResult.output,
            parseTagResult.output,
          ];

          const index = accumulator.findIndex(
            (exercise) => exercise.id === exerciseId,
          );
          if (index === -1) {
            accumulator.push({
              id: exercise.id,
              name: exercise.name,
              tags: [tag],
            });
            return accumulator;
          }

          const current = accumulator[index];
          if (!current) {
            return accumulator;
          }

          return accumulator.with(index, {
            id: current.id,
            name: current.name,
            tags: [...current.tags, tag],
          });
        },
        [],
      );

      return { result: "success", data: payload };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
