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
import { muscleExerciseMappings } from "database/tables/muscle-exercise-mappings";
import { muscles as musclesSchema } from "database/tables/muscles";
import { drizzle } from "drizzle-orm/d1";
import type { Input } from "valibot";

type GetExercisesWithTargetsByTraineeId = (
  context: AppLoadContext,
) => (
  traineeId: string,
) => Promise<{ result: "success"; data: Payload } | { result: "failure" }>;
type Payload = Input<typeof payloadSchema>;
const targetSchema = object({
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
      targets: array(targetSchema),
    }),
  ]),
);
export const getExercisesWithTargetsByTraineeId: GetExercisesWithTargetsByTraineeId =
  (context) => async (traineeId) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({
          exerciseId: sql`${exercises.id}`.as("exerciseId"),
          exerciseName: sql`${exercises.name}`.as("exerciseName"),
          muscleId: sql`${musclesSchema.id}`.as("muscleId"),
          muscleName: sql`${musclesSchema.name}`.as("muscleName"),
        })
        .from(exercises)
        .leftJoin(
          muscleExerciseMappings,
          eq(exercises.id, muscleExerciseMappings.exerciseId),
        )
        .leftJoin(
          musclesSchema,
          eq(muscleExerciseMappings.muscleId, musclesSchema.id),
        )
        .where(eq(exercises.traineeId, traineeId))
        .orderBy(desc(exercises.createdAt));

      const payload = data.reduce<Payload>(
        (accumulator, { exerciseId, exerciseName, muscleId, muscleName }) => {
          const [parseTargetResult, parseExerciseResult] = [
            safeParse(targetSchema, { id: muscleId, name: muscleName }),
            safeParse(exerciseSchema, { id: exerciseId, name: exerciseName }),
          ];
          if (!(parseTargetResult.success && parseExerciseResult.success)) {
            return accumulator;
          }
          const [exercise, target] = [
            parseExerciseResult.output,
            parseTargetResult.output,
          ];

          const index = accumulator.findIndex(
            (exercise) => exercise.id === exerciseId,
          );
          if (index === -1) {
            accumulator.push({
              id: exercise.id,
              name: exercise.name,
              targets: [target],
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
            targets: [...current.targets, target],
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
