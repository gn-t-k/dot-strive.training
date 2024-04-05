import { desc, eq } from "drizzle-orm";

import { muscles as musclesSchema } from "database/tables/muscles";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { validateMuscle } from "./schema";

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
      const muscles = data.flatMap((datum) => {
        const result = validateMuscle(datum);

        return result ? [result] : [];
      });

      return { result: "success", data: muscles };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
