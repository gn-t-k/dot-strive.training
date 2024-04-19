import type { AppLoadContext } from "@remix-run/cloudflare";
import { tags } from "database/tables/tags";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { type Input, object, safeParse, string } from "valibot";

type FindTagById = (
  context: AppLoadContext,
) => (
  tagId: string,
) => Promise<
  | { result: "found"; data: Payload }
  | { result: "not-found" }
  | { result: "failure" }
>;
type Payload = Input<typeof tagSchema>;
const tagSchema = object({ id: string(), name: string() });

export const findTagById: FindTagById = (context) => async (tagId) => {
  try {
    const database = drizzle(context.cloudflare["env"].DB);
    const data = await database
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(tags)
      .where(eq(tags.id, tagId))
      .get();

    if (!data) {
      return { result: "not-found" };
    }

    const parseResult = safeParse(tagSchema, data);
    if (!parseResult.success) {
      return { result: "failure" };
    }
    const tag = parseResult.output;

    return { result: "found", data: tag };
  } catch (error) {
    return {
      result: "failure",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
