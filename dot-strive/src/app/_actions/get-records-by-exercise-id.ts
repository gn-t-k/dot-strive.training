"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { validateTraining } from "../_schemas/training";
import { err, ok } from "../_utils/result";

import type { Record } from "../_schemas/training";
import type { UTCDateString } from "../_schemas/utc-date-string";
import type { Result } from "../_utils/result";

type GetRecordsByExerciseId = (props: {
  traineeId: string;
  exerciseId: string;
  take: number;
}) => Promise<Result<{ date: UTCDateString; records: Record[] }[], Error>>;
export const getRecordsByExerciseId: GetRecordsByExerciseId = async (props) => {
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

    const data = await prisma.training.findMany({
      where: {
        records: {
          some: {
            exerciseId: props.exerciseId,
          },
        },
      },
      include: {
        records: {
          where: {
            exerciseId: props.exerciseId,
          },
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
      orderBy: { date: "desc" },
      take: props.take,
    });
    if (!data) {
      throw new Error(
        `記録データが見つかりませんでした: ${JSON.stringify(props)}`
      );
    }
    if (data.some((record) => record.traineeId !== trainee.value.id)) {
      throw new Error(
        `認証に失敗しました: ${JSON.stringify({
          sessionTraineeId: trainee.value.id,
          exerciseTraineeId: data.map((record) => record.traineeId),
        })}`
      );
    }
    const trainings = data.map((training) => {
      const validateTrainingResult = validateTraining({
        ...training,
        date: training.date.toISOString(),
      });
      if (validateTrainingResult.isErr) {
        throw new Error(
          `記録データの検証に失敗しました: ${validateTrainingResult.error.message}`
        );
      }
      return validateTrainingResult.value;
    });

    return ok(
      trainings.map((training) => ({
        date: training.date,
        records: training.records,
      }))
    );
  } catch (error) {
    return err(
      new Error(
        `記録データの取得に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
