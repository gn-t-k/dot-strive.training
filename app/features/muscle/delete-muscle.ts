import { eq } from "drizzle-orm";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from "database/tables/muscle-exercise-mappings";
import { muscles as musclesSchema } from "database/tables/muscles";
import { drizzle } from "drizzle-orm/d1";

type DeleteMuscle = (
  context: AppLoadContext,
) => (props: { id: string }) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const deleteMuscle: DeleteMuscle =
  (context) =>
  async ({ id }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const [, [deleted]] = await database.batch([
        database
          .delete(muscleExerciseMappingsSchema)
          .where(eq(muscleExerciseMappingsSchema.muscleId, id)),
        database
          .delete(musclesSchema)
          .where(eq(musclesSchema.id, id))
          .returning({ id: musclesSchema.id, name: musclesSchema.name }),
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
