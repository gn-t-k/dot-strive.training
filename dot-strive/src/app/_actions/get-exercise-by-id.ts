"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateExercise } from "../_schemas/exercise";
import { err, ok } from "../_utils/result";

import type { Exercise } from "../_schemas/exercise";
import type { Result } from "../_utils/result";

type GetExerciseById = (props: {
  traineeId: string;
  exerciseId: string;
}) => Promise<Result<Exercise, Error>>;
export const getExerciseById: GetExerciseById = async (props) => {
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

    const data = await prisma.exercise.findUnique({
      where: {
        id: props.exerciseId,
      },
      include: {
        targets: true,
      },
    });
    if (!data) {
      throw new Error(
        `種目データが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }
    if (data.traineeId !== trainee.value.id) {
      throw new Error(
        `認証に失敗しました: ${JSON.stringify({
          sessionTraineeId: trainee.value.id,
          exerciseTraineeId: data.traineeId,
        })}`
      );
    }

    const validateExerciseResult = validateExercise(data);
    if (validateExerciseResult.isErr) {
      throw new Error(
        `種目データの検証に失敗しました: ${validateExerciseResult.error.message}`
      );
    }
    const exercise = validateExerciseResult.value;

    return ok(exercise);
  } catch (error) {
    return err(
      new Error(
        `部位データの取得に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
