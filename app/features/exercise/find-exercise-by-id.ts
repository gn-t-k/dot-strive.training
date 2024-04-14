import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises } from "database/tables/exercises";
import { tagExerciseMappings } from "database/tables/tag-exercise-mappings";
import { tags } from "database/tables/tags";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { type Input, array, merge, object, safeParse, string } from "valibot";

type FindExerciseById = (
  context: AppLoadContext,
) => (
  exerciseId: string,
) => Promise<
  | { result: "found"; data: Payload }
  | { result: "not-found" }
  | { result: "failure" }
>;
type Payload = Input<typeof payloadSchema>;
const tagSchema = object({
  id: string(),
});
const exerciseSchema = object({
  id: string(),
  name: string(),
});
const payloadSchema = merge([
  exerciseSchema,
  object({
    tags: array(tagSchema),
  }),
]);
export const findExerciseById: FindExerciseById =
  (context) => async (exerciseId) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({
          exerciseId: sql`${exercises.id}`.as("exerciseId"),
          exerciseName: exercises.name,
          tagId: sql`${tags.id}`.as("tagId"),
        })
        .from(exercises)
        .leftJoin(
          tagExerciseMappings,
          eq(exercises.id, tagExerciseMappings.exerciseId),
        )
        .leftJoin(tags, eq(tagExerciseMappings.tagId, tags.id))
        .where(eq(exercises.id, exerciseId));

      if (data.length === 0) {
        return { result: "not-found" };
      }

      const [payload] = data.reduce<Payload[]>(
        (acc, { exerciseId, exerciseName, tagId }) => {
          const [parseTagResult, parseExerciseResult] = [
            safeParse(tagSchema, { id: tagId }),
            safeParse(exerciseSchema, { id: exerciseId, name: exerciseName }),
          ];
          if (!(parseTagResult.success && parseExerciseResult.success)) {
            return acc;
          }
          const [exercise, tag] = [
            parseExerciseResult.output,
            parseTagResult.output,
          ];

          const index = acc.findIndex((exercise) => exercise.id === exerciseId);
          if (index === -1) {
            acc.push({
              id: exercise.id,
              name: exercise.name,
              tags: [tag],
            });
            return acc;
          }

          const current = acc[index];
          if (!current) {
            return acc;
          }

          current.tags.push(tag);
          return acc.with(index, {
            id: current.id,
            name: current.name,
            tags: current.tags,
          });
        },
        [],
      );

      if (!payload) {
        return { result: "not-found" };
      }

      return { result: "found", data: payload };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
