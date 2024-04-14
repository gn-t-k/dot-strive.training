import { eq } from "drizzle-orm";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { tagExerciseMappings as tagExerciseMappingsSchema } from "database/tables/tag-exercise-mappings";
import { tags as tagsSchema } from "database/tables/tags";
import { drizzle } from "drizzle-orm/d1";

type DeleteTag = (
  context: AppLoadContext,
) => (props: { id: string }) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const deleteTag: DeleteTag =
  (context) =>
  async ({ id }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);
      const [, [deleted]] = await database.batch([
        database
          .delete(tagExerciseMappingsSchema)
          .where(eq(tagExerciseMappingsSchema.tagId, id)),
        database
          .delete(tagsSchema)
          .where(eq(tagsSchema.id, id))
          .returning({ id: tagsSchema.id, name: tagsSchema.name }),
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
