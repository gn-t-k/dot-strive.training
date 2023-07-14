import { DeleteMuscleClient } from "./delete-muscle-client";
import { getMuscleById } from "../_repositories/get-muscle-by-id";

import type { FC } from "react";

type Props = {
  traineeId: string;
  muscleId: string;
};
export const DeleteMuscle: FC<Props> = async (props) => {
  const getMuscleResult = await getMuscleById({
    traineeId: props.traineeId,
    muscleId: props.muscleId,
  });
  if (getMuscleResult.isErr()) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const muscle = getMuscleResult.value;

  return <DeleteMuscleClient traineeId={props.traineeId} muscle={muscle} />;
};
