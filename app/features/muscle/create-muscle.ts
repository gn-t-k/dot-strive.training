import { muscles as musclesSchema } from "database/tables/muscles";

import type { AppLoadContext } from "@remix-run/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { Muscle } from "./schema";

type CreateMuscle = (context: AppLoadContext) => (props: {
  muscle: Muscle;
  traineeId: string;
}) => Promise<
  | { result: "success"; data: { id: string; name: string } }
  | { result: "failure" }
>;
export const createMuscle: CreateMuscle =
  (context) =>
  async ({ muscle, traineeId }) => {
    try {
      const database = drizzle(context.cloudflare.env.DB);
      const created = await database
        .insert(musclesSchema)
        .values({
          id: muscle.id,
          name: muscle.name,
          traineeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: musclesSchema.id, name: musclesSchema.name })
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
