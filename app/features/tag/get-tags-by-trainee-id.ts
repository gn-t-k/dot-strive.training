import { desc, eq } from "drizzle-orm";

import { tags as tagsSchema } from "database/tables/tags";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";

type GetTagsByTraineeId = (
  context: AppLoadContext,
) => (
  traineeId: string,
) => Promise<
  | { result: "success"; data: { id: string; name: string }[] }
  | { result: "failure" }
>;
export const getTagsByTraineeId: GetTagsByTraineeId =
  (context) => async (traineeId) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({ id: tagsSchema.id, name: tagsSchema.name })
        .from(tagsSchema)
        .where(eq(tagsSchema.traineeId, traineeId))
        .orderBy(desc(tagsSchema.createdAt));

      return { result: "success", data };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
