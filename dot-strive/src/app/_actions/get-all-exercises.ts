"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateExercise, type Exercise } from "../_schemas/exercise";
import { err, ok } from "../_utils/result";

import type { Result } from "../_utils/result";

type GetAllExercises = (props: {
  traineeId: string;
}) => Promise<Result<Exercise[], Error>>;
export const getAllExercises: GetAllExercises = async (props) => {
  try {
    const trainee = await getTraineeBySession();
    if (trainee.isErr) {
      throw new Error(
        `トレーニーの取得に失敗しました: ${trainee.error.message}`
      );
    }
    if (trainee.value.id !== props.traineeId) {
      throw new Error(
        `認証に失敗しました: ${JSON.stringify({
          sessionTraineeId: trainee.value.id,
          propsTraineeId: props.traineeId,
        })}`
      );
    }

    const data = await prisma.trainee.findUnique({
      where: {
        id: props.traineeId,
      },
      include: {
        exercises: {
          include: {
            targets: true,
          },
        },
      },
    });

    if (!data) {
      throw new Error(
        `種目データが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }

    const exercises = data.exercises.map((exercise) => {
      const result = validateExercise(exercise);

      if (result.isErr) {
        throw new Error(
          `種目データの検証に失敗しました: ${result.error.message}`
        );
      }

      return result.value;
    });

    return ok(exercises);
  } catch (error) {
    return err(
      new Error(
        `トレーニングデータの取得に失敗しました: ${
          error instanceof Error ? error.message : "不明なエラー"
        }`
      )
    );
  }
};
