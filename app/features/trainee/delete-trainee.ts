import type { AppLoadContext } from "@remix-run/cloudflare";
import { isNonEmptyArray } from "app/utils/non-empty-array";
import { exercises } from "database/tables/exercises";
import { tagExerciseMappings } from "database/tables/tag-exercise-mappings";
import { tags } from "database/tables/tags";
import { trainees } from "database/tables/trainees";
import { trainingSessions } from "database/tables/training-sessions";
import { trainingSets } from "database/tables/training-sets";
import { trainings } from "database/tables/trainings";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

type DeleteTrainee = (
  context: AppLoadContext,
) => (props: { id: string }) => Promise<{ success: boolean }>;
export const deleteTrainee: DeleteTrainee =
  (context) =>
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: そのうち直す
  async ({ id }) => {
    try {
      const database = drizzle(context.cloudflare["env"].DB);

      // データの削除にパフォーマンスは求めないので、DBに負荷をかけすぎないようにjoinせず削除する

      const trainingIds = await database
        .select({ id: trainings.id })
        .from(trainings)
        .where(eq(trainings.traineeId, id));
      const sessionIds =
        trainingIds.length === 0
          ? []
          : await database
              .select({ id: trainingSessions.id })
              .from(trainingSessions)
              .where(
                inArray(
                  trainingSessions.trainingId,
                  trainingIds.map(({ id }) => id),
                ),
              );
      const setIds =
        sessionIds.length === 0
          ? []
          : await database
              .select({ id: trainingSets.id })
              .from(trainingSets)
              .where(
                inArray(
                  trainingSets.sessionId,
                  sessionIds.map(({ id }) => id),
                ),
              );
      const [tagIds, exerciseIds] = await Promise.all([
        database
          .select({ id: tags.id })
          .from(tags)
          .where(eq(tags.traineeId, id)),
        database
          .select({ id: exercises.id })
          .from(exercises)
          .where(eq(exercises.traineeId, id)),
      ]);

      const batchItems = [
        setIds.length === 0
          ? null
          : database.delete(trainingSets).where(
              inArray(
                trainingSets.id,
                setIds.map(({ id }) => id),
              ),
            ),
        sessionIds.length === 0
          ? null
          : database.delete(trainingSessions).where(
              inArray(
                trainingSessions.id,
                sessionIds.map(({ id }) => id),
              ),
            ),
        trainingIds.length === 0
          ? null
          : database.delete(trainings).where(
              inArray(
                trainings.id,
                trainingIds.map(({ id }) => id),
              ),
            ),
        tagIds.length === 0
          ? null
          : database.delete(tagExerciseMappings).where(
              inArray(
                tagExerciseMappings.tagId,
                tagIds.map(({ id }) => id),
              ),
            ),
        exerciseIds.length === 0
          ? null
          : database.delete(tagExerciseMappings).where(
              inArray(
                tagExerciseMappings.exerciseId,
                exerciseIds.map(({ id }) => id),
              ),
            ),
        database.delete(exercises).where(eq(exercises.traineeId, id)),
        database.delete(tags).where(eq(tags.traineeId, id)),
        database
          .delete(trainees)
          .where(eq(trainees.id, id))
          .returning({ id: trainees.id }),
      ].flatMap((batchItem) => (batchItem === null ? [] : [batchItem]));
      if (!isNonEmptyArray(batchItems)) {
        return { success: false };
      }

      await database.batch(batchItems);

      return { success: true };
    } catch {
      return { success: false };
    }
  };
