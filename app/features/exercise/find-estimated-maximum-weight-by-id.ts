import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";
import { eq, max } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type FindEstimatedMaximumWeightById = (
  context: AppLoadContext,
) => (
  id: string,
) => Promise<
  | { result: "found"; data: Payload }
  | { result: "not-found" }
  | { result: "failure" }
>;
type Payload = {
  estimatedMaximumWeight: number;
  training: {
    id: string;
    date: Date;
  };
};
export const findEstimatedMaximumWeightById: FindEstimatedMaximumWeightById =
  (context) => async (id) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({
          estimatedMaximumWeight: max(trainingSets.estimatedMaximumWeight),
          trainingId: trainings.id,
          trainingDate: trainings.date,
        })
        .from(trainingSets)
        .innerJoin(
          trainingSessions,
          eq(trainingSets.sessionId, trainingSessions.id),
        )
        .innerJoin(trainings, eq(trainingSessions.trainingId, trainings.id))
        .where(eq(trainingSessions.exerciseId, id))
        .get();

      if (!data?.estimatedMaximumWeight) {
        return { result: "not-found" };
      }

      return {
        result: "found",
        data: {
          estimatedMaximumWeight: data.estimatedMaximumWeight,
          training: {
            id: data.trainingId,
            date: data.trainingDate,
          },
        },
      };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
