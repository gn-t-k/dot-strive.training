"use client";

import { DeleteTrainingClient } from "./delete-training-client";
import { getTrainingById } from "../_repositories/get-training-by-id";

import type { FC } from "react";

type Props = {
  traineeId: string;
  trainingId: string;
};
export const DeleteTraining: FC<Props> = async (props) => {
  const getTrainingResult = await getTrainingById({
    traineeId: props.traineeId,
    trainingId: props.trainingId,
  });
  if (getTrainingResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;

  return (
    <DeleteTrainingClient traineeId={props.traineeId} training={training} />
  );
};
