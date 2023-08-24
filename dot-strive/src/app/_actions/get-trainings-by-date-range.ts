"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateTraining } from "../_schemas/training";
import { err, ok } from "../_utils/result";

import type { Training } from "../_schemas/training";
import type { Result } from "../_utils/result";

type GetTrainingsByDateRange = (props: {
  traineeId: string;
  from: Date;
  to: Date;
}) => Promise<Result<Training[], Error>>;
export const getTrainingsByDateRange: GetTrainingsByDateRange = async (
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

    const data = await prisma.trainee.findUnique({
      where: {
        id: props.traineeId,
      },
      include: {
        trainings: {
          where: {
            date: {
              gte: props.from,
              lte: props.to,
            },
          },
          include: {
            records: {
              include: {
                exercise: {
                  include: {
                    targets: true,
                  },
                },
                sets: {
                  orderBy: {
                    order: "asc",
                  },
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            date: "asc",
          },
        },
      },
    });

    if (!data) {
      throw new Error(
        `トレーニングが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }

    const trainings = data.trainings.map((training) => {
      const result = validateTraining({
        ...training,
        date: training.date.toISOString(),
      });

      if (result.isErr) {
        throw new Error(
          `トレーニングデータの検証に失敗しました: ${result.error.message}`
        );
      }

      return result.value;
    });

    return ok(trainings);
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
