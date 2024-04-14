import { createId } from "@paralleldrive/cuid2";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises as exercisesSchema } from "database/tables/exercises";
import { tagExerciseMappings as tagExerciseMappingsSchema } from "database/tables/tag-exercise-mappings";
import { tags as tagsSchema } from "database/tables/tags";
import { trainees as traineesSchema } from "database/tables/trainees";
import { drizzle } from "drizzle-orm/d1";
import { validateExercise } from "../exercise/schema";
import { validateTag } from "../tag/schema";

type InitializeTrainee = (
  context: AppLoadContext,
) => (props: { name: string; image: string; authUserId: string }) => Promise<
  | { result: "success"; data: { id: string; name: string; image: string } }
  | { result: "failure"; error: string }
>;
export const initializeTrainee: InitializeTrainee =
  (context) =>
  async ({ name, image, authUserId }) => {
    try {
      const traineeId = createId();
      const { tags, exercises } = generateInitialTagsAndExercises();
      const now = new Date();
      const [createdAt, updatedAt] = [now, now];

      const database = drizzle(context.cloudflare["env"].DB);
      const [[trainee]] = await database.batch([
        database
          .insert(traineesSchema)
          .values({
            id: traineeId,
            name,
            image,
            authUserId,
            createdAt,
            updatedAt,
          })
          .returning({
            id: traineesSchema.id,
            name: traineesSchema.name,
            image: traineesSchema.image,
          }),
        database.insert(tagsSchema).values(
          tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            traineeId,
            createdAt,
            updatedAt,
          })),
        ),
        database.insert(exercisesSchema).values(
          exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            traineeId,
            createdAt,
            updatedAt,
          })),
        ),
        database.insert(tagExerciseMappingsSchema).values(
          exercises.flatMap((exercise) =>
            exercise.tags.map((tag) => ({
              tagId: tag.id,
              exerciseId: exercise.id,
            })),
          ),
        ),
      ]);

      if (!trainee) {
        return { result: "failure", error: "Failed to create trainee" };
      }

      return { result: "success", data: trainee };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

const generateInitialTagsAndExercises = () => {
  const 大腿四頭筋 = validateTag({
    id: createId(),
    name: "大腿四頭筋",
  });
  const ハムストリング = validateTag({
    id: createId(),
    name: "ハムストリング",
  });
  const 大臀筋 = validateTag({
    id: createId(),
    name: "大臀筋",
  });
  const 広背筋 = validateTag({
    id: createId(),
    name: "広背筋",
  });
  const 僧帽筋 = validateTag({
    id: createId(),
    name: "僧帽筋",
  });
  const 脊柱起立筋 = validateTag({
    id: createId(),
    name: "脊柱起立筋",
  });
  const 三角筋前部 = validateTag({
    id: createId(),
    name: "三角筋前部",
  });
  const 三角筋中部 = validateTag({
    id: createId(),
    name: "三角筋中部",
  });
  const 三角筋後部 = validateTag({
    id: createId(),
    name: "三角筋後部",
  });
  const 上腕三頭筋 = validateTag({
    id: createId(),
    name: "上腕三頭筋",
  });
  const 上腕二頭筋 = validateTag({
    id: createId(),
    name: "上腕二頭筋",
  });
  const 大胸筋 = validateTag({
    id: createId(),
    name: "大胸筋",
  });

  const スクワット = validateExercise({
    id: createId(),
    name: "スクワット",
    tags: [大腿四頭筋, ハムストリング, 大臀筋],
  });
  const レッグプレス = validateExercise({
    id: createId(),
    name: "レッグプレス",
    tags: [大腿四頭筋, ハムストリング, 大臀筋],
  });
  const ブルガリアンスクワット = validateExercise({
    id: createId(),
    name: "ブルガリアンスクワット",
    tags: [大腿四頭筋, ハムストリング, 大臀筋],
  });
  const デッドリフト = validateExercise({
    id: createId(),
    name: "デッドリフト",
    tags: [脊柱起立筋, ハムストリング, 大臀筋, 僧帽筋],
  });
  const オーバーヘッドプレス = validateExercise({
    id: createId(),
    name: "オーバーヘッドプレス",
    tags: [三角筋前部, 三角筋中部],
  });
  const 懸垂 = validateExercise({
    id: createId(),
    name: "懸垂",
    tags: [広背筋, 上腕二頭筋, 三角筋後部],
  });
  const ラットプルダウン = validateExercise({
    id: createId(),
    name: "ラットプルダウン",
    tags: [広背筋, 上腕三頭筋, 三角筋後部],
  });
  const ベンチプレス = validateExercise({
    id: createId(),
    name: "ベンチプレス",
    tags: [大胸筋, 上腕三頭筋, 三角筋前部, 三角筋中部],
  });
  const ベントオーバーロー = validateExercise({
    id: createId(),
    name: "ベントオーバーロー",
    tags: [広背筋, 僧帽筋, 上腕二頭筋, 三角筋後部],
  });
  const ダンベルローイング = validateExercise({
    id: createId(),
    name: "ダンベルローイング",
    tags: [広背筋, 僧帽筋, 上腕二頭筋, 三角筋後部],
  });
  const ヒップスラスト = validateExercise({
    id: createId(),
    name: "ヒップスラスト",
    tags: [大臀筋, ハムストリング],
  });
  const プルオーバー = validateExercise({
    id: createId(),
    name: "プルオーバー",
    tags: [広背筋, 上腕三頭筋, 大胸筋],
  });
  const ダンベルフライ = validateExercise({
    id: createId(),
    name: "ダンベルフライ",
    tags: [大胸筋, 上腕三頭筋],
  });
  const レッグエクステンション = validateExercise({
    id: createId(),
    name: "レッグエクステンション",
    tags: [大腿四頭筋],
  });
  const レッグカール = validateExercise({
    id: createId(),
    name: "レッグカール",
    tags: [ハムストリング],
  });
  const シュラッグ = validateExercise({
    id: createId(),
    name: "シュラッグ",
    tags: [僧帽筋],
  });
  const サイドレイズ = validateExercise({
    id: createId(),
    name: "サイドレイズ",
    tags: [三角筋中部],
  });
  const リアレイズ = validateExercise({
    id: createId(),
    name: "リアレイズ",
    tags: [三角筋後部],
  });
  const キックバック = validateExercise({
    id: createId(),
    name: "キックバック",
    tags: [上腕三頭筋],
  });
  const アームカール = validateExercise({
    id: createId(),
    name: "アームカール",
    tags: [上腕二頭筋],
  });

  return {
    tags: [
      大腿四頭筋,
      ハムストリング,
      大臀筋,
      広背筋,
      僧帽筋,
      脊柱起立筋,
      三角筋前部,
      三角筋中部,
      三角筋後部,
      上腕三頭筋,
      上腕二頭筋,
      大胸筋,
    ].flatMap((tag) => (tag === undefined ? [] : [tag])),
    exercises: [
      スクワット,
      レッグプレス,
      ブルガリアンスクワット,
      デッドリフト,
      オーバーヘッドプレス,
      懸垂,
      ラットプルダウン,
      ベンチプレス,
      ベントオーバーロー,
      ダンベルローイング,
      ヒップスラスト,
      プルオーバー,
      ダンベルフライ,
      レッグエクステンション,
      レッグカール,
      シュラッグ,
      サイドレイズ,
      リアレイズ,
      キックバック,
      アームカール,
    ].flatMap((exercise) => (exercise === undefined ? [] : [exercise])),
  };
};
