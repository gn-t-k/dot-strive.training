import type { AppLoadContext } from "@remix-run/cloudflare";
import { trainees } from "database/tables/trainees";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type FindTraineeByAuthUserId = (
  context: AppLoadContext,
) => (
  authUserId: string,
) => Promise<
  | { result: "find"; data: { id: string; name: string; image: string } }
  | { result: "not found" }
  | { result: "failure"; error: string }
>;
export const findTraineeByAuthUserId: FindTraineeByAuthUserId =
  (context) => async (authUserId) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const trainee = await database
        .select({ id: trainees.id, name: trainees.name, image: trainees.image })
        .from(trainees)
        .where(eq(trainees.authUserId, authUserId))
        .get();

      if (!trainee) {
        return { result: "not found" };
      }

      return { result: "find", data: trainee };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };
