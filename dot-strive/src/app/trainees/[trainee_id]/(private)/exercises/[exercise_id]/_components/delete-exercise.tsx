import { DeleteExerciseClient } from "./delete-exercise-client";
import { getExerciseById } from "../_repositories/get-exercise-by-id";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const DeleteExercise: FC<Props> = async (props) => {
  const getExerciseResult = await getExerciseById({
    traineeId: props.traineeId,
    exerciseId: props.exerciseId,
  });
  if (getExerciseResult.isErr()) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const exercise = getExerciseResult.value;

  return (
    <DeleteExerciseClient traineeId={props.traineeId} exercise={exercise} />
  );
};
