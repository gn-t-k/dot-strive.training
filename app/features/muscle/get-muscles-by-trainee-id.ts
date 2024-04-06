import { desc, eq } from "drizzle-orm";

import { muscles as musclesSchema } from "database/tables/muscles";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

type GetMusclesByTraineeId = (
  context: AppLoadContext,
) => (
  traineeId: string,
) => Promise<
  | { result: "success"; data: { id: string; name: string }[] }
  | { result: "failure" }
>;
export const getMusclesByTraineeId: GetMusclesByTraineeId =
  (context) => async (traineeId) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({ id: musclesSchema.id, name: musclesSchema.name })
        .from(musclesSchema)
        .where(eq(musclesSchema.traineeId, traineeId))
        .orderBy(desc(musclesSchema.createdAt));

      return { result: "success", data };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
