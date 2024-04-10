import { createId } from "@paralleldrive/cuid2";
import type { AppLoadContext } from "@remix-run/cloudflare";
import { exercises as exercisesSchema } from "database/tables/exercises";
import { muscleExerciseMappings as muscleExerciseMappingsSchema } from "database/tables/muscle-exercise-mappings";
import { muscles as musclesSchema } from "database/tables/muscles";
import { trainees as traineesSchema } from "database/tables/trainees";
import { drizzle } from "drizzle-orm/d1";
import { validateExercise } from "../exercise/schema";
import { validateMuscle } from "../muscle/schema";

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
      const { muscles, exercises } = generateInitialMusclesAndExercises();
      const now = new Date();
      const [createdAt, updatedAt] = [now, now];

      const database = drizzle(context.cloudflare.env.DB);
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
        database.insert(musclesSchema).values(
          muscles.map((muscle) => ({
            id: muscle.id,
            name: muscle.name,
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
        database.insert(muscleExerciseMappingsSchema).values(
          exercises.flatMap((exercise) =>
            exercise.targets.map((target) => ({
              muscleId: target.id,
              exerciseId: exercise.id,
            })),
          ),
        ),
      ]);

      return { result: "success", data: trainee };
    } catch (error) {
      return {
        result: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

const generateInitialMusclesAndExercises = () => {
  const 大腿四頭筋 = validateMuscle({
    id: createId(),
    name: "大腿四頭筋",
  });
  const ハムストリング = validateMuscle({
    id: createId(),
    name: "ハムストリング",
  });
  const 大臀筋 = validateMuscle({
    id: createId(),
    name: "大臀筋",
  });
  const 広背筋 = validateMuscle({
    id: createId(),
    name: "広背筋",
  });
  const 僧帽筋 = validateMuscle({
    id: createId(),
    name: "僧帽筋",
  });
  const 脊柱起立筋 = validateMuscle({
    id: createId(),
    name: "脊柱起立筋",
  });
  const 三角筋前部 = validateMuscle({
    id: createId(),
    name: "三角筋前部",
  });
  const 三角筋中部 = validateMuscle({
    id: createId(),
    name: "三角筋中部",
  });
  const 三角筋後部 = validateMuscle({
    id: createId(),
    name: "三角筋後部",
  });
  const 上腕三頭筋 = validateMuscle({
    id: createId(),
    name: "上腕三頭筋",
  });
  const 上腕二頭筋 = validateMuscle({
    id: createId(),
    name: "上腕二頭筋",
  });
  const 大胸筋 = validateMuscle({
    id: createId(),
    name: "大胸筋",
  });

  const スクワット = validateExercise({
    id: createId(),
    name: "スクワット",
    targets: [大腿四頭筋, ハムストリング, 大臀筋],
  });
  const レッグプレス = validateExercise({
    id: createId(),
    name: "レッグプレス",
    targets: [大腿四頭筋, ハムストリング, 大臀筋],
  });
  const ブルガリアンスクワット = validateExercise({
    id: createId(),
    name: "ブルガリアンスクワット",
    targets: [大腿四頭筋, ハムストリング, 大臀筋],
  });
  const デッドリフト = validateExercise({
    id: createId(),
    name: "デッドリフト",
    targets: [脊柱起立筋, ハムストリング, 大臀筋, 僧帽筋],
  });
  const オーバーヘッドプレス = validateExercise({
    id: createId(),
    name: "オーバーヘッドプレス",
    targets: [三角筋前部, 三角筋中部],
  });
  const 懸垂 = validateExercise({
    id: createId(),
    name: "懸垂",
    targets: [広背筋, 上腕二頭筋, 三角筋後部],
  });
  const ラットプルダウン = validateExercise({
    id: createId(),
    name: "ラットプルダウン",
    targets: [広背筋, 上腕三頭筋, 三角筋後部],
  });
  const ベンチプレス = validateExercise({
    id: createId(),
    name: "ベンチプレス",
    targets: [大胸筋, 上腕三頭筋, 三角筋前部, 三角筋中部],
  });
  const ベントオーバーロー = validateExercise({
    id: createId(),
    name: "ベントオーバーロー",
    targets: [広背筋, 僧帽筋, 上腕二頭筋, 三角筋後部],
  });
  const ダンベルローイング = validateExercise({
    id: createId(),
    name: "ダンベルローイング",
    targets: [広背筋, 僧帽筋, 上腕二頭筋, 三角筋後部],
  });
  const ヒップスラスト = validateExercise({
    id: createId(),
    name: "ヒップスラスト",
    targets: [大臀筋, ハムストリング],
  });
  const プルオーバー = validateExercise({
    id: createId(),
    name: "プルオーバー",
    targets: [広背筋, 上腕三頭筋, 大胸筋],
  });
  const ダンベルフライ = validateExercise({
    id: createId(),
    name: "ダンベルフライ",
    targets: [大胸筋, 上腕三頭筋],
  });
  const レッグエクステンション = validateExercise({
    id: createId(),
    name: "レッグエクステンション",
    targets: [大腿四頭筋],
  });
  const レッグカール = validateExercise({
    id: createId(),
    name: "レッグカール",
    targets: [ハムストリング],
  });
  const シュラッグ = validateExercise({
    id: createId(),
    name: "シュラッグ",
    targets: [僧帽筋],
  });
  const サイドレイズ = validateExercise({
    id: createId(),
    name: "サイドレイズ",
    targets: [三角筋中部],
  });
  const リアレイズ = validateExercise({
    id: createId(),
    name: "リアレイズ",
    targets: [三角筋後部],
  });
  const キックバック = validateExercise({
    id: createId(),
    name: "キックバック",
    targets: [上腕三頭筋],
  });
  const アームカール = validateExercise({
    id: createId(),
    name: "アームカール",
    targets: [上腕二頭筋],
  });

  return {
    muscles: [
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
    ].flatMap((muscle) => (muscle === undefined ? [] : [muscle])),
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
