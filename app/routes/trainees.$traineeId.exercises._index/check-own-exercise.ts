import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises } from "database/tables/exercises";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type CheckOwnExercise = (
  context: AppLoadContext,
) => (props: { traineeId: string; exerciseId: string }) => Promise<
  { result: "success"; data: boolean } | { result: "failure" }
>;
export const checkOwnExercise: CheckOwnExercise =
  (context) =>
  async ({ traineeId, exerciseId }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const data = await database
        .select({ id: exercises.id })
        .from(exercises)
        .where(
          and(eq(exercises.traineeId, traineeId), eq(exercises.id, exerciseId)),
        );

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
