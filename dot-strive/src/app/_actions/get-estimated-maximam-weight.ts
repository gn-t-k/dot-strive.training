"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { err, ok } from "../_utils/result";

import type { Result } from "../_utils/result";

type GetEstimatedMaximumWeight = (props: {
  traineeId: string;
  exerciseId: string;
}) => Promise<Result<number, Error>>;
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
      },
    });

    const estimatedMaximumWeight = data?.estimatedMaximumWeight;
    if (!estimatedMaximumWeight) {
      throw new Error(`推定1RMの取得に失敗しました: ${JSON.stringify(props)}`);
    }

    return ok(estimatedMaximumWeight);
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
