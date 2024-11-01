import { and, asc, desc, eq, gte, lt, lte, sql } from "drizzle-orm";

import { exercises } from "database/tables/exercises";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { determineDateFormat } from "app/utils/determine-date-format";
import { tags } from "database/tables/tags";
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { drizzle } from "drizzle-orm/d1";
import { deserializeTraining } from "./deserialize-training";

type GetTrainings = (
  context: AppLoadContext,
) => (
  props: Pagination &
    (
      | { tagId: string }
      | { traineeId: string }
      | { exerciseId: string; weight?: number | undefined }
    ),
) => Promise<{ result: "success"; data: Payload } | { result: "failure" }>;
type Pagination = { cursor: Date; size: number } | { date: string };
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

    const filters = [
      "tagId" in props && eq(tags.id, props.tagId),
      "traineeId" in props && eq(trainings.traineeId, props.traineeId),
      "exerciseId" in props && eq(exercises.id, props.exerciseId),
      "weight" in props &&
        props.weight !== undefined &&
        eq(trainingSets.weight, props.weight),
    ].filter((filter) => filter !== false);

    if ("date" in props) {
      const dateFormat = determineDateFormat(props.date);
      const dateConditions =
        {
          "yyyy-MM": [
            gte(trainings.date, startOfMonth(props.date)),
            lte(trainings.date, endOfMonth(props.date)),
          ],
          "yyyy-MM-dd": [
            gte(trainings.date, startOfDay(props.date)),
            lte(trainings.date, endOfDay(props.date)),
          ],
          invalid: [],
        }[dateFormat] || [];
      filters.push(...dateConditions);
    }

    if ("cursor" in props) {
      const cursorConditions = [lt(trainings.date, startOfDay(props.cursor))];
      filters.push(...cursorConditions);
    }

    const filteredQuery = baseQuery.where(and(...filters));
    const orderedQuery = filteredQuery.orderBy(
      desc(trainings.date),
      asc(trainingSessions.order),
      asc(trainingSets.order),
    );
    const limitedQuery =
      "cursor" in props ? filteredQuery.limit(props.size) : orderedQuery;
    const data = await limitedQuery
      .where(and(...filters))
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
