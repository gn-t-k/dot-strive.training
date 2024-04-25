import { sql } from "drizzle-orm";

import { trainings } from "database/tables/trainings";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainingSessions } from "database/tables/training-sessions";
import { drizzle } from "drizzle-orm/d1";
import type { Training } from "./schema";
import { serializeTraining } from "./serialize-training";

type CreateTraining = (context: AppLoadContext) => (props: {
  training: Training;
  traineeId: string;
}) => Promise<
  | { result: "success"; data: { id: string } }
  | { result: "failure"; error: string }
>;
export const createTraining: CreateTraining =
  (context) =>
  async ({ training, traineeId }) => {
    try {
      const { sessions, sets } = serializeTraining(training);

      const database = drizzle(context.cloudflare["env"].DB);
      const [[created]] = await database.batch([
        database
          .insert(trainings)
          .values({
            id: training.id,
            date: training.date,
            traineeId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
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

      return created
        ? { result: "success", data: created }
        : { result: "failure", error: "Unknown error" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
