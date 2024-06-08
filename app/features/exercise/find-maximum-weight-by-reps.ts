import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { and, eq, max } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type FindMaximumWeightByReps = (context: AppLoadContext) => (props: {
  exerciseId: string;
  reps: number;
}) => Promise<
  | { result: "found"; weight: number }
  | { result: "not-found" }
  | { result: "failure" }
>;
export const findMaximumWeightByReps: FindMaximumWeightByReps =
  (context) =>
  async ({ exerciseId, reps }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({
          weight: max(trainingSets.weight),
        })
        .from(trainingSets)
        .innerJoin(
          trainingSessions,
          eq(trainingSets.sessionId, trainingSessions.id),
        )
        .where(
          and(
            eq(trainingSessions.exerciseId, exerciseId),
            eq(trainingSets.repetition, reps),
          ),
        )
        .get();

      if (!data?.weight) {
        return { result: "not-found" };
      }

      return {
        result: "found",
        weight: data.weight,
      };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
