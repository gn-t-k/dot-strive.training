import { eq } from "drizzle-orm";

import { muscles as musclesSchema } from "database/tables/muscles";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Muscle } from "./schema";

type UpdateMuscle = (
  context: AppLoadContext,
) => (
  props: Muscle,
) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const updateMuscle: UpdateMuscle =
  (context) =>
  async ({ id, name }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const updated = await database
        .update(musclesSchema)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(musclesSchema.id, id))
        .returning({ id: musclesSchema.id, name: musclesSchema.name })
        .get();

      return updated
        ? { result: "success", data: updated }
        : { result: "failure" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
