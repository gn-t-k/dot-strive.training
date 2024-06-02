import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises } from "database/tables/exercises";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import {
  type Input,
  array,
  date,
  merge,
  number,
  object,
  string,
} from "valibot";
import { deserializeTraining } from "./deserialize-training";

type GetExerciseTrainingsByDateRange = (
  context: AppLoadContext,
) => (
  exerciseId: string,
  dateRange: { from: Date; to: Date },
) => Promise<{ result: "success"; data: Payload } | { result: "failure" }>;
type Payload = Input<typeof payloadSchema>;
const exerciseSchema = object({
  id: string(),
  name: string(),
});
const trainingSchema = object({
  id: string(),
  date: date(),
});
const sessionSchema = object({
  id: string(),
  memo: string(),
});
const setSchema = object({
  id: string(),
  weight: number(),
  repetition: number(),
  rpe: number(),
  estimatedMaximumWeight: number(),
});
const payloadSchema = array(
  merge([
    trainingSchema,
    object({
      sessions: array(
        merge([
          sessionSchema,
          object({
            exercise: exerciseSchema,
            sets: array(setSchema),
          }),
        ]),
      ),
    }),
  ]),
);
export const getExerciseTrainingsByDateRange: GetExerciseTrainingsByDateRange =
  (context) =>
  async (exerciseId, { from, to }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({
          trainingId: sql`${trainings.id}`.as("trainingId"),
          date: trainings.date,
          sessionId: sql`${trainingSessions.id}`.as("sessionId"),
          exerciseId: sql`${exercises.id}`.as("exerciseId"),
          exerciseName: exercises.name,
          memo: trainingSessions.memo,
          sessionOrder: sql`${trainingSessions.order}`.as("sessionOrder"),
          setId: sql`${trainingSets.id}`.as("setId"),
          weight: trainingSets.weight,
          repetition: trainingSets.repetition,
          rpe: trainingSets.rpe,
          estimatedMaximumWeight: trainingSets.estimatedMaximumWeight,
          setOrder: sql`${trainingSets.order}`.as("setOrder"),
        })
        .from(trainings)
        .leftJoin(
          trainingSessions,
          eq(trainings.id, trainingSessions.trainingId),
        )
        .leftJoin(trainingSets, eq(trainingSessions.id, trainingSets.sessionId))
        .leftJoin(exercises, eq(trainingSessions.exerciseId, exercises.id))
        .where(
          and(
            eq(exercises.id, exerciseId),
            gte(trainings.date, from),
            lte(trainings.date, to),
          ),
        )
        .orderBy(
          desc(trainings.date),
          asc(trainingSessions.order),
          asc(trainingSets.order),
        );

      const payload = deserializeTraining(data);

      return { result: "success", data: payload };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
