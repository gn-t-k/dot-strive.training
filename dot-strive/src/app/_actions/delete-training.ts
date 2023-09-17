"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import {
  getEstimatedMaximumWeight,
  validateTraining,
} from "../_schemas/training";
import { err, ok } from "../_utils/result";

import type { Training } from "../_schemas/training";
import type { Result } from "../_utils/result";

type DeleteTraining = (props: {
  traineeId: string;
  trainingId: string;
}) => Promise<Result<Training, Error>>;
export const deleteTraining: DeleteTraining = async (props) => {
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
        trainings: {
          where: {
            id: props.trainingId,
          },
          include: {
            records: {
              include: {
                sets: true,
                exercise: {
                  include: {
                    targets: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!data) {
      throw new Error(
        `トレーニングデータが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }

    const trainingData = data.trainings[0];
    if (!trainingData || data.trainings.length > 1) {
      throw new Error(`trainingのデータが不正です: ${JSON.stringify(data)}`);
    }

    const result = validateTraining({
      id: trainingData.id,
      date: trainingData.date.toISOString(),
      records: trainingData.records.map((record) => {
        return {
          id: record.id,
          memo: record.memo,
          exercise: record.exercise,
          order: record.order,
          sets: record.sets.map((set) => {
            return {
              id: set.id,
              weight: set.weight,
              repetition: set.repetition,
              estimatedMaximumWeight: getEstimatedMaximumWeight({
                weight: set.weight,
                repetition: set.repetition,
              }),
              order: set.order,
            };
          }),
        };
      }),
    });
    if (result.isErr) {
      throw new Error(
        `トレーニングデータの検証に失敗しました: ${result.error.message}`
      );
    }
    const training = result.value;

    const recordIds = training.records.map((record) => record.id);
    const setIds = training.records.flatMap((record) =>
      record.sets.map((set) => set.id)
    );

    await prisma.$transaction(async (tx) => {
      await tx.set.deleteMany({
        where: {
          id: {
            in: setIds,
          },
        },
      });
      await tx.record.deleteMany({
        where: {
          id: {
            in: recordIds,
          },
        },
      });
      await tx.training.delete({
        where: {
          id: training.id,
        },
      });
    });

    return ok(training);
  } catch (error) {
    return err(
      new Error(
        `トレーニングデータの削除に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
