"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateTraining } from "../_schemas/training";
import { none, some } from "../_utils/option";
import { err, ok } from "../_utils/result";

import type { Training } from "../_schemas/training";
import type { Option } from "../_utils/option";
import type { Result } from "../_utils/result";

type GetEstimatedMaximumWeight = (props: {
  traineeId: string;
  exerciseId: string;
}) => Promise<
  Result<
    Option<{
      estimatedMaximumWeight: number;
      weight: number;
      repetition: number;
      training: Training;
    }>,
    Error
  >
>;
export const getEstimatedMaximumWeight: GetEstimatedMaximumWeight = async (
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

    const data = await prisma.set.findFirst({
      where: {
        record: {
          exerciseId: props.exerciseId,
          training: {
            traineeId: props.traineeId,
          },
        },
      },
      orderBy: {
        estimatedMaximumWeight: "desc",
      },
      select: {
        estimatedMaximumWeight: true,
        weight: true,
        repetition: true,
        record: {
          select: {
            training: {
              include: {
                records: {
                  include: {
                    exercise: {
                      include: {
                        targets: true,
                      },
                    },
                    sets: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (data === null) {
      return ok(none());
    }

    const validateTrainingResult = validateTraining({
      ...data.record.training,
      date: data.record.training.date.toISOString(),
    });
    if (validateTrainingResult.isErr) {
      throw new Error(
        `トレーニングの取得に失敗しました: ${validateTrainingResult.error.message}`
      );
    }
    const training = validateTrainingResult.value;

    return ok(
      data === null
        ? none()
        : some({
            estimatedMaximumWeight: data.estimatedMaximumWeight,
            weight: data.weight,
            repetition: data.repetition,
            training,
          })
    );
  } catch (error) {
    return err(
      new Error(
        `推定1RMの取得に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
