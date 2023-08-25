"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateMuscle } from "../_schemas/muscle";
import { err, ok } from "../_utils/result";

import type { Muscle } from "../_schemas/muscle";
import type { Result } from "../_utils/result";

type DeleteMuscle = (props: {
  traineeId: string;
  muscleId: string;
}) => Promise<Result<Muscle, Error>>;
export const deleteMuscle: DeleteMuscle = async (props) => {
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

    const existMuscle = await prisma.muscle.findUnique({
      where: {
        id: props.muscleId,
      },
    });

    if (!existMuscle) {
      throw new Error(
        `部位データが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }

    const validateMuscleResult = validateMuscle(existMuscle);
    if (validateMuscleResult.isErr) {
      throw new Error(
        `部位データの検証に失敗しました: ${JSON.stringify(
          validateMuscleResult.error
        )}`
      );
    }

    if (existMuscle.traineeId !== trainee.value.id) {
      throw new Error(
        `認証に失敗しました: ${JSON.stringify({
          sessionTraineeId: trainee.value.id,
          muscleTraineeId: existMuscle.traineeId,
        })}`
      );
    }

    await prisma.muscle.delete({
      where: {
        id: props.muscleId,
      },
    });

    return ok(validateMuscleResult.value);
  } catch (error) {
    return err(
      new Error(
        `部位データの削除に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
