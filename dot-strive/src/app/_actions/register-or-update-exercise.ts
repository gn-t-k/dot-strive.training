"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateExercise } from "../_schemas/exercise";
import { err, ok } from "../_utils/result";

import type { Exercise } from "../_schemas/exercise";
import type { Result } from "../_utils/result";

type RegisterOrUpdateExercise = (props: {
  traineeId: string;
  exercise: Exercise;
}) => Promise<Result<Exercise, Error>>;
export const registerOrUpdateExercise: RegisterOrUpdateExercise = async (
  props
) => {
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

    const newExercise = props.exercise;
    const oldExercise = await prisma.exercise.findUnique({
      where: {
        id: newExercise.id,
      },
      include: {
        targets: true,
      },
    });

    if (oldExercise === null) {
      const created = await prisma.exercise.create({
        data: {
          id: newExercise.id,
          name: newExercise.name,
          targets: {
            connect: newExercise.targets.map((target) => ({
              id: target.id,
            })),
          },
          traineeId: trainee.value.id,
        },
        include: {
          targets: true,
        },
      });
      const validateExerciseResult = validateExercise(created);
      if (validateExerciseResult.isErr) {
        throw new Error(
          `種目データの検証に失敗しました: ${validateExerciseResult.error.message}`
        );
      }
      const exercise = validateExerciseResult.value;

      return ok(exercise);
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.exercise.update({
          where: {
            id: oldExercise.id,
          },
          data: {
            targets: {
              disconnect: oldExercise.targets.map((target) => ({
                id: target.id,
              })),
            },
          },
        });

        await tx.exercise.update({
          where: {
            id: oldExercise.id,
          },
          data: {
            targets: {
              connect: newExercise.targets.map((target) => ({ id: target.id })),
            },
          },
          include: {
            targets: true,
          },
        });
      });
      const updated = await prisma.exercise.update({
        where: {
          id: oldExercise.id,
        },
        data: {
          name: newExercise.name,
        },
        include: {
          targets: true,
        },
      });

      const validateExerciseResult = validateExercise(updated);
      if (validateExerciseResult.isErr) {
        throw new Error(
          `種目データの検証に失敗しました: ${validateExerciseResult.error.message}`
        );
      }
      const exercise = validateExerciseResult.value;

      return ok(exercise);
    }
  } catch (error) {
    return err(
      new Error(
        `種目データの更新に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
