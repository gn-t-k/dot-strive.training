"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateMuscle } from "../_schemas/muscle";
import { err, ok } from "../_utils/result";

import type { Muscle } from "../_schemas/muscle";
import type { Result } from "../_utils/result";

type GetMuscleById = (props: {
  traineeId: string;
  muscleId: string;
}) => Promise<Result<Muscle, Error>>;
export const getMuscleById: GetMuscleById = async (props) => {
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

    const data = await prisma.muscle.findUnique({
      where: {
        id: props.muscleId,
      },
    });

    if (!data) {
      throw new Error(
        `部位データが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }

    if (data.traineeId !== trainee.value.id) {
      throw new Error(
        `認証に失敗しました: ${JSON.stringify({
          sessionTraineeId: trainee.value.id,
          muscleTraineeId: props.traineeId,
        })}`
      );
    }

    const validateMuscleResult = validateMuscle(data);
    if (validateMuscleResult.isErr) {
      throw new Error(
        `部位データの検証に失敗しました: ${validateMuscleResult.error.message}`
      );
    }
    const muscle = validateMuscleResult.value;

    return ok(muscle);
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
