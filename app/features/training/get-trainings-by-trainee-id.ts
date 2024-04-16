import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { array, date, merge, number, object, safeParse, string } from "valibot";

import { exercises } from "database/tables/exercises";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Input } from "valibot";

type GetTrainingsByTraineeId = (
  context: AppLoadContext,
) => (
  traineeId: string,
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
export const getTrainingsByTraineeId: GetTrainingsByTraineeId =
  (context) =>
  async (traineeId, { from, to }) => {
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
            eq(trainings.traineeId, traineeId),
            gte(trainings.date, from),
            lte(trainings.date, to),
          ),
        )
        .orderBy(
          desc(trainings.date),
          asc(trainingSessions.order),
          asc(trainingSets.order),
        );

      const payload = data.reduce<Payload>((accumulator, current) => {
        const [
          parseTrainingResult,
          parseSessionResult,
          parseExerciseResult,
          parseSetResult,
        ] = [
          safeParse(trainingSchema, {
            id: current.trainingId,
            date: current.date,
          }),
          safeParse(sessionSchema, {
            id: current.sessionId,
            memo: current.memo,
          }),
          safeParse(exerciseSchema, {
            id: current.exerciseId,
            name: current.exerciseName,
          }),
          safeParse(setSchema, {
            id: current.setId,
            weight: current.weight,
            repetition: current.repetition,
            rpe: current.rpe,
            estimatedMaximumWeight: current.estimatedMaximumWeight,
          }),
        ];
        if (
          !(
            parseTrainingResult.success &&
            parseSessionResult.success &&
            parseExerciseResult.success &&
            parseSetResult.success
          )
        ) {
          return accumulator;
        }
        const [currentTraining, currentSession, currentExercise, currentSet] = [
          parseTrainingResult.output,
          parseSessionResult.output,
          parseExerciseResult.output,
          parseSetResult.output,
        ];

        const trainingIndex = accumulator.findIndex(
          (training) => training.id === currentTraining.id,
        );
        if (trainingIndex === -1) {
          accumulator.push({
            ...currentTraining,
            sessions: [
              {
                ...currentSession,
                exercise: currentExercise,
                sets: [currentSet],
              },
            ],
          });
          return accumulator;
        }

        const foundTraining = accumulator[trainingIndex];
        if (!foundTraining) {
          return accumulator;
        }

        const sessionIndex = foundTraining.sessions.findIndex(
          (session) => session.id === currentSession.id,
        );
        if (sessionIndex === -1) {
          return accumulator.with(trainingIndex, {
            ...foundTraining,
            sessions: [
              ...foundTraining.sessions,
              {
                ...currentSession,
                exercise: currentExercise,
                sets: [currentSet],
              },
            ],
          });
        }

        const foundSession = foundTraining.sessions[sessionIndex];
        if (!foundSession) {
          return accumulator;
        }

        return accumulator.with(trainingIndex, {
          ...foundTraining,
          sessions: foundTraining.sessions.with(sessionIndex, {
            ...foundSession,
            sets: [...foundSession.sets, currentSet],
          }),
        });
      }, []);

      return { result: "success", data: payload };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
