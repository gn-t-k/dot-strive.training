import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { and, eq, max } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type FindMaximumRepsByWeight = (context: AppLoadContext) => (props: {
  exerciseId: string;
  weight: number;
}) => Promise<
  | { result: "found"; reps: number }
  | { result: "not-found" }
  | { result: "failure" }
>;
export const findMaximumRepsByWeight: FindMaximumRepsByWeight =
  (context) =>
  async ({ exerciseId, weight }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({
          reps: max(trainingSets.repetition),
        })
        .from(trainingSets)
        .innerJoin(
          trainingSessions,
          eq(trainingSets.sessionId, trainingSessions.id),
        )
        .where(
          and(
            eq(trainingSessions.exerciseId, exerciseId),
            eq(trainingSets.weight, weight),
          ),
        )
        .get();

      if (!data?.reps) {
        return { result: "not-found" };
      }

      return {
        result: "found",
        reps: data.reps,
      };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
