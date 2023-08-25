"use server";

import { getServerSession } from "next-auth";
import { ulid } from "ulid";

import { prisma } from "@/app/_libs/prisma/client";

import { nextAuthOptions } from "../_libs/next-auth/options";
import { validateExercise } from "../_schemas/exercise";
import { validateMuscle } from "../_schemas/muscle";
import { validateTrainee } from "../_schemas/trainee";
import { err, ok } from "../_utils/result";

import type { Trainee } from "../_schemas/trainee";
import type { Result } from "../_utils/result";

type InitializeTrainee = () => Promise<Result<Trainee, Error>>;
export const initializeTrainee: InitializeTrainee = async () => {
  try {
    const session = await getServerSession(nextAuthOptions);
    const authUserId = session?.user.id;
    if (!authUserId) {
      throw new Error("セッションが取得できませんでした");
    }

    await prisma.$transaction(async (tx) => {
      /**
       * トレーニーの登録
       */
      const data = await prisma.trainee.findUnique({
        where: {
          authUserId,
        },
      });
      if (data !== null) {
        throw new Error(
          `既にトレーニーが登録されています: ${JSON.stringify(data)}`
        );
      }

      const { name, image } = session.user;
      if (!name || !image) {
        throw new Error(
          `ユーザー情報が取得できませんでした: ${JSON.stringify(session.user)}`
        );
      }

      const createdTrainee = await tx.trainee.create({
        data: {
          id: ulid(),
          name,
          image,
          authUserId,
        },
      });
      const validateTraineeResult = validateTrainee(createdTrainee);
      if (validateTraineeResult.isErr) {
        throw new Error(
          `トレーニーの検証に失敗しました: ${validateTraineeResult.error.message}`
        );
      }
      const trainee = validateTraineeResult.value;

      /**
       * 部位の登録
       */
      const muscleNames = Array.from(
        new Set(defaultExercises.flatMap((exercise) => exercise.targetNames))
      );
      const muscles = muscleNames.flatMap((name) => {
        const result = validateMuscle({
          id: ulid(),
          name,
        });

        return result.isErr ? [] : [result.value];
      });
      await tx.muscle.createMany({
        data: muscles.map((muscle) => ({
          ...muscle,
          traineeId: trainee.id,
        })),
      });

      /**
       * 種目の登録
       */
      const exercises = defaultExercises.flatMap((exercise) => {
        const result = validateExercise({
          id: ulid(),
          name: exercise.exerciseName,
          targets: exercise.targetNames.flatMap((targetName) => {
            const target = muscles.find((muscle) => muscle.name === targetName);

            return target ? [target] : [];
          }),
        });

        return result.isErr ? [] : [result.value];
      });
      await Promise.all(
        exercises.map(
          async (exercise) =>
            await tx.exercise.create({
              data: {
                id: exercise.id,
                name: exercise.name,
                traineeId: trainee.id,
                targets: {
                  connect: exercise.targets.map((target) => ({
                    id: target.id,
                  })),
                },
              },
            })
        )
      );
    });

    const data = await prisma.trainee.findUnique({
      where: {
        authUserId,
      },
    });
    if (!data) {
      throw new Error(
        `トレーニーが見つかりませんでした: ${JSON.stringify(session)}`
      );
    }
    const validateTraineeResult = validateTrainee(data);
    if (validateTraineeResult.isErr) {
      throw new Error(
        `トレーニーの検証に失敗しました: ${validateTraineeResult.error.message}`
      );
    }
    const trainee = validateTraineeResult.value;

    return ok(trainee);
  } catch (error) {
    return err(
      new Error(
        `トレーニーの登録処理に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};

type DefaultExercise = {
  exerciseName: string;
  targetNames: string[];
};
const defaultExercises: DefaultExercise[] = [
  {
    exerciseName: "ベンチプレス",
    targetNames: ["大胸筋", "三角筋前部", "上腕三頭筋"],
  },
  {
    exerciseName: "スクワット",
    targetNames: ["大腿四頭筋", "ハムストリングス", "大殿筋", "ふくらはぎ"],
  },
  {
    exerciseName: "デッドリフト",
    targetNames: ["脊柱起立筋", "僧帽筋", "ハムストリングス", "大殿筋"],
  },
  {
    exerciseName: "オーバーヘッドプレス",
    targetNames: ["三角筋前部", "上腕三頭筋"],
  },
  {
    exerciseName: "ベントオーバーロウ",
    targetNames: ["広背筋", "僧帽筋", "三角筋後部"],
  },
  {
    exerciseName: "チンニング",
    targetNames: ["広背筋", "上腕二頭筋", "三角筋後部"],
  },
  {
    exerciseName: "プルオーバー",
    targetNames: ["大胸筋", "広背筋", "上腕三頭筋"],
  },
  {
    exerciseName: "サイドレイズ",
    targetNames: ["三角筋中部"],
  },
  {
    exerciseName: "カーフレイズ",
    targetNames: ["ふくらはぎ"],
  },
  {
    exerciseName: "アームカール",
    targetNames: ["上腕二頭筋"],
  },
];
