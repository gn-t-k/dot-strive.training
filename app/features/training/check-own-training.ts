import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainings } from "database/tables/trainings";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type CheckOwnTraining = (
  context: AppLoadContext,
) => (props: { traineeId: string; trainingId: string }) => Promise<
  { result: "success"; data: boolean } | { result: "failure" }
>;
export const checkOwnTraining: CheckOwnTraining =
  (context) =>
  async ({ traineeId, trainingId }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const data = await database
        .select({ id: trainings.id })
        .from(trainings)
        .where(
          and(eq(trainings.traineeId, traineeId), eq(trainings.id, trainingId)),
        );

      return {
        result: "success",
        data: data.length > 0,
      };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
