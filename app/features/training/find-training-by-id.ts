import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises as exercisesSchema } from "database/tables/exercises";
import { trainingSessions as trainingSessionsSchema } from "database/tables/training-sessions";
import { trainingSets as trainingSetsSchema } from "database/tables/training-sets";
import { trainings as trainingsSchema } from "database/tables/trainings";
import { asc, desc, eq, sql } from "drizzle-orm";
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

type FindTrainingById = (
  context: AppLoadContext,
) => (
  trainingId: string,
) => Promise<
  | { result: "found"; data: Payload }
  | { result: "not-found" }
  | { result: "failure" }
>;
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
const payloadSchema = merge([
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
]);
export const findTrainingById: FindTrainingById =
  (context) => async (trainingId) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({
          trainingId: sql`${trainingsSchema.id}`.as("trainingId"),
          date: trainingsSchema.date,
          sessionId: sql`${trainingSessionsSchema.id}`.as("sessionId"),
          exerciseId: sql`${exercisesSchema.id}`.as("exerciseId"),
          exerciseName: exercisesSchema.name,
          memo: trainingSessionsSchema.memo,
          sessionOrder: sql`${trainingSessionsSchema.order}`.as("sessionOrder"),
          setId: sql`${trainingSetsSchema.id}`.as("setId"),
          weight: trainingSetsSchema.weight,
          repetition: trainingSetsSchema.repetition,
          rpe: trainingSetsSchema.rpe,
          estimatedMaximumWeight: trainingSetsSchema.estimatedMaximumWeight,
          setOrder: sql`${trainingSetsSchema.order}`.as("setOrder"),
        })
        .from(trainingsSchema)
        .leftJoin(
          trainingSessionsSchema,
          eq(trainingsSchema.id, trainingSessionsSchema.trainingId),
        )
        .leftJoin(
          trainingSetsSchema,
          eq(trainingSessionsSchema.id, trainingSetsSchema.sessionId),
        )
        .leftJoin(
          exercisesSchema,
          eq(trainingSessionsSchema.exerciseId, exercisesSchema.id),
        )
        .where(eq(trainingsSchema.id, trainingId))
        .orderBy(
          desc(trainingsSchema.date),
          asc(trainingSessionsSchema.order),
          asc(trainingSetsSchema.order),
        );
      if (data.length === 0) {
        return { result: "not-found" };
      }

      const [payload] = deserializeTraining(data);

      if (!payload) {
        return { result: "not-found" };
      }

      return {
        result: "found",
        data: payload,
      };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
