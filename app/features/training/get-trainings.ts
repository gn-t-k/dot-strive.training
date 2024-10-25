import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import {} from "valibot";

import { exercises } from "database/tables/exercises";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { tagExerciseMappings } from "database/tables/tag-exercise-mappings";
import { tags } from "database/tables/tags";
import { drizzle } from "drizzle-orm/d1";
import { deserializeTraining } from "./deserialize-training";

type GetTrainings = (
  context: AppLoadContext,
) => (
  props:
    | { tagId: string; dateRange: DateRange }
    | { traineeId: string; dateRange: DateRange }
    | { exerciseId: string; dateRange: DateRange }
    | { exerciseId: string; weight: number },
) => Promise<{ result: "success"; data: Payload } | { result: "failure" }>;
type DateRange = { from: Date; to: Date };
type Payload = Training[];
type Training = {
  id: string;
  date: Date;
  sessions: Session[];
};
type Session = {
  id: string;
  memo: string;
  exercise: Exercise;
  sets: Set[];
};
type Exercise = {
  id: string;
  name: string;
};
type Set = {
  id: string;
  weight: number;
  repetition: number;
  rpe: number;
  estimatedMaximumWeight: number;
};

export const getTrainings: GetTrainings = (context) => async (props) => {
  try {
    const database = drizzle(context.cloudflare["env"].DB);

    const baseQuery = database
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
      .leftJoin(trainingSessions, eq(trainings.id, trainingSessions.trainingId))
      .leftJoin(trainingSets, eq(trainingSessions.id, trainingSets.sessionId))
      .leftJoin(exercises, eq(trainingSessions.exerciseId, exercises.id))
      .$dynamic();

    const tagIdFiltered =
      "tagId" in props
        ? {
            query: baseQuery
              .leftJoin(
                tagExerciseMappings,
                eq(exercises.id, tagExerciseMappings.exerciseId),
              )
              .leftJoin(tags, eq(tagExerciseMappings.tagId, tags.id)),
            conditions: [eq(tags.id, props.tagId)],
          }
        : { query: baseQuery, conditions: [] };

    const traineeIdFiltered = {
      query: tagIdFiltered.query,
      conditions:
        "traineeId" in props
          ? [
              ...tagIdFiltered.conditions,
              eq(trainings.traineeId, props.traineeId),
            ]
          : [...tagIdFiltered.conditions],
    };

    const exerciseIdFiltered = {
      query: traineeIdFiltered.query,
      conditions:
        "exerciseId" in props
          ? [
              ...traineeIdFiltered.conditions,
              eq(exercises.id, props.exerciseId),
            ]
          : [...traineeIdFiltered.conditions],
    };

    const weightFiltered = {
      query: exerciseIdFiltered.query,
      conditions:
        "weight" in props
          ? [
              ...exerciseIdFiltered.conditions,
              eq(trainingSets.weight, props.weight),
            ]
          : [...exerciseIdFiltered.conditions],
    };

    const dateRangeFiltered = {
      query: weightFiltered.query,
      conditions:
        "dateRange" in props
          ? [
              ...weightFiltered.conditions,
              gte(trainings.date, props.dateRange.from),
              lte(trainings.date, props.dateRange.to),
            ]
          : [...weightFiltered.conditions],
    };

    const data = await dateRangeFiltered.query
      .where(and(...dateRangeFiltered.conditions))
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
