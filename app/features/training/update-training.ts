import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";
import { eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { flatTraining } from "./flat-training";
import type { Training } from "./schema";

type UpdateTraining = (context: AppLoadContext) => (props: {
  training: Training;
}) => Promise<
  | { result: "success"; data: { id: string } }
  | { result: "failure"; error: string }
>;
export const updateTraining: UpdateTraining =
  (context) =>
  async ({ training }) => {
    try {
      const { sessions, sets } = flatTraining(training);

      const database = drizzle(context.cloudflare.env.DB);

      const sessionIds = await database
        .select({ id: trainingSessions.id })
        .from(trainingSessions)
        .where(eq(trainingSessions.trainingId, training.id));

      const [_sets, _sessions, [updated]] = await database.batch([
        database.delete(trainingSets).where(
          inArray(
            trainingSets.sessionId,
            sessionIds.map(({ id }) => id),
          ),
        ),
        database
          .delete(trainingSessions)
          .where(eq(trainingSessions.trainingId, training.id)),
        database
          .update(trainings)
          .set({
            date: training.date,
            updatedAt: new Date(),
          })
          .where(eq(trainings.id, training.id))
          .returning({ id: trainings.id }),
        database.insert(trainingSessions).values(sessions),
        // D1のvariablesの数の上限が100なので、それを回避するために生で書いている
        database.run(
          sql.raw(`
            INSERT INTO "training_sets"
              ("id", "weight", "repetition", "rpe", "order", "estimated_maximum_weight", "session_id")
            VALUES
              ${sets
                .map(
                  (set) =>
                    `('${set.id}', ${set.weight}, ${set.repetition}, ${set.rpe}, ${set.order}, ${set.estimatedMaximumWeight}, '${set.sessionId}')`,
                )
                .join(",")}
            ;
          `),
        ),
      ]);

      return { result: "success", data: updated };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
