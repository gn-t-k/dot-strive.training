import { eq } from "drizzle-orm";

import { tags as tagsSchema } from "database/tables/tags";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Tag } from "./schema";

type UpdateTag = (
  context: AppLoadContext,
) => (
  props: Tag,
) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const updateTag: UpdateTag =
  (context) =>
  async ({ id, name }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const updated = await database
        .update(tagsSchema)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(tagsSchema.id, id))
        .returning({ id: tagsSchema.id, name: tagsSchema.name })
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
