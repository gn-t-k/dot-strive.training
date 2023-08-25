"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateMuscle } from "../_schemas/muscle";
import { err, ok } from "../_utils/result";

import type { Muscle } from "../_schemas/muscle";
import type { Result } from "../_utils/result";

type RegisterOrUpdateMuscle = (props: {
  traineeId: string;
  muscle: Muscle;
}) => Promise<Result<Muscle, Error>>;
export const registerOrUpdateMuscle: RegisterOrUpdateMuscle = async (props) => {
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

    const newMuscle = props.muscle;
    const oldMuscle = await prisma.muscle.findUnique({
      where: {
        id: newMuscle.id,
      },
      include: {
        trainee: true,
      },
    });

    if (oldMuscle === null) {
      const created = await prisma.muscle.create({
        data: {
          id: newMuscle.id,
          name: newMuscle.name,
          traineeId: trainee.value.id,
        },
      });

      const validateMuscleResult = validateMuscle(created);
      if (validateMuscleResult.isErr) {
        throw new Error(
          `部位データの検証に失敗しました: ${validateMuscleResult.error.message}`
        );
      }
      const muscle = validateMuscleResult.value;

      return ok(muscle);
    } else {
      const updated = await prisma.muscle.update({
        where: {
          id: oldMuscle.id,
        },
        data: {
          name: newMuscle.name,
        },
      });
      const validateMuscleResult = validateMuscle(updated);
      if (validateMuscleResult.isErr) {
        throw new Error(
          `部位データの検証に失敗しました: ${validateMuscleResult.error.message}`
        );
      }
      const muscle = validateMuscleResult.value;

      return ok(muscle);
    }
  } catch (error) {
    return err(
      new Error(
        `部位データの更新に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
