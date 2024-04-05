import type { AppLoadContext } from "@remix-run/cloudflare";
import { muscles } from "database/tables/muscles";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type CheckOwnMuscle = (
  context: AppLoadContext,
) => (props: { traineeId: string; muscleId: string }) => Promise<
  { result: "success"; data: boolean } | { result: "failure" }
>;
export const checkOwnMuscle: CheckOwnMuscle =
  (context) =>
  async ({ traineeId, muscleId }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({ id: muscles.id })
        .from(muscles)
        .where(and(eq(muscles.traineeId, traineeId), eq(muscles.id, muscleId)));

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
