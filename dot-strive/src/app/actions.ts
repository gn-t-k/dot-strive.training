"use server";

import { ok, err } from "neverthrow";

import { prisma } from "@/app/_libs/prisma/client";

import { validateTraining } from "./_schemas/training";

import type { TraineeId } from "./_schemas/trainee";
import type { Training } from "./_schemas/training";
import type { Result } from "neverthrow";

type GetTrainingsByDateRange = (props: {
  traineeId: TraineeId;
  from: Date;
  to: Date;
}) => Promise<Result<Training[], Error>>;
export const getTrainingsByDateRange: GetTrainingsByDateRange = async (
  props
) => {
  try {
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

      if (result.isErr()) {
        throw new Error(
          `トレーニングデータの検証に失敗しました: ${JSON.stringify(training)}`
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
