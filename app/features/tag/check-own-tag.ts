import type { AppLoadContext } from "@remix-run/cloudflare";
import { tags } from "database/tables/tags";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type CheckOwnTag = (
  context: AppLoadContext,
) => (props: { traineeId: string; tagId: string }) => Promise<
  { result: "success"; data: boolean } | { result: "failure" }
>;
export const checkOwnTag: CheckOwnTag =
  (context) =>
  async ({ traineeId, tagId }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({ id: tags.id })
        .from(tags)
        .where(and(eq(tags.traineeId, traineeId), eq(tags.id, tagId)));

      return {
        result: "success",
        data: data.length > 0,
      };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
