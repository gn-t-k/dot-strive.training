import { eq, inArray } from "drizzle-orm";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";
import { drizzle } from "drizzle-orm/d1";

type DeleteTraining = (
  context: AppLoadContext,
) => (props: { id: string }) => Promise<
  | { result: "success"; data: { id: string; date: Date } }
  | { result: "failure" }
>;
export const deleteTraining: DeleteTraining =
  (context) =>
  async ({ id }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const sessionIds = await database
        .select({ id: trainingSessions.id })
        .from(trainingSessions)
        .where(eq(trainingSessions.trainingId, id));

      const [_sets, _sessions, [deleted]] = await database.batch([
        database.delete(trainingSets).where(
          inArray(
            trainingSets.sessionId,
            sessionIds.map(({ id }) => id),
          ),
        ),
        database
          .delete(trainingSessions)
          .where(eq(trainingSessions.trainingId, id)),
        database
          .delete(trainings)
          .where(eq(trainings.id, id))
          .returning({ id: trainings.id, date: trainings.date }),
      ]);

      return deleted
        ? { result: "success", data: deleted }
        : { result: "failure" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
