import { type SQL, and, asc, desc, eq, gte, lt, lte, sql } from "drizzle-orm";

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
  props: Identifier & SetAttributes & Pagination,
) => Promise<{ result: "success"; data: Payload } | { result: "failure" }>;
type Identifier =
  | { tagId: string }
  | { traineeId: string }
  | { exerciseId: string };
type SetAttributes = {
  weight?: number | undefined;
  repetition?: number | undefined;
};
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

    const filters: SQL[] = [
      "tagId" in props && eq(tags.id, props.tagId),
      "traineeId" in props && eq(trainings.traineeId, props.traineeId),
      "exerciseId" in props && eq(exercises.id, props.exerciseId),
      "weight" in props &&
        props.weight !== undefined &&
        eq(trainingSets.weight, props.weight),
      "repetition" in props &&
        props.repetition !== undefined &&
        eq(trainingSets.repetition, props.repetition),
      "cursor" in props && lt(trainings.date, startOfDay(props.cursor)),
      "date" in props &&
        (() => {
          const dateFormat = determineDateFormat(props.date);
          const dateConditions = {
            "yyyy-MM": [
              gte(trainings.date, startOfMonth(props.date)),
              lte(trainings.date, endOfMonth(props.date)),
            ],
            "yyyy-MM-dd": [
              gte(trainings.date, startOfDay(props.date)),
              lte(trainings.date, endOfDay(props.date)),
            ],
            invalid: [],
          }[dateFormat];
          return and(...dateConditions);
        })(),
    ].filter((filter): filter is SQL => filter !== false);
    const filteredQuery = baseQuery.where(and(...filters));

    const orderedQuery = filteredQuery.orderBy(
      desc(trainings.date),
      asc(trainingSessions.order),
      asc(trainingSets.order),
    );

    /**
     * クエリの単位は1セットだが、レスポンスの単位は1セッション
     * たとえばsizeが10の場合10セッションをレスポンスとして返す必要がある
     * 1セッション20セット超えることはそうそうないだろうと仮定して、多めに20セットクエリして、deserialize後にsizeの大きさにsliceする
     */
    const data = await ("cursor" in props
      ? orderedQuery.limit(props.size * 20)
      : orderedQuery
    )
      .then((result) => deserializeTraining(result))
      .then((result) =>
        "cursor" in props ? result.slice(0, props.size) : result,
      );

    return { result: "success", data };
  } catch (error) {
    return {
      result: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
