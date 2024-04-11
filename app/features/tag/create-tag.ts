import { tags as tagsSchema } from "database/tables/tags";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Tag } from "./schema";

type CreateTag = (context: AppLoadContext) => (props: {
  tag: Tag;
  traineeId: string;
}) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const createTag: CreateTag =
  (context) =>
  async ({ tag, traineeId }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const created = await database
        .insert(tagsSchema)
        .values({
          id: tag.id,
          name: tag.name,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: tagsSchema.id, name: tagsSchema.name })
        .get();

      return created
        ? { result: "success", data: created }
        : { result: "failure" };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
