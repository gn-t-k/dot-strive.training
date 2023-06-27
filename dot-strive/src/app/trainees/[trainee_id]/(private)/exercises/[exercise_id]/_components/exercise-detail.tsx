import { getExerciseById } from "@/features/exercise/get-by-id";
import { getFetcher } from "@/features/http-client/fetcher";
import { getAllMusclesBySession } from "@/features/muscle/get-all-by-session";

import { ExerciseEditor } from "./exercise-editor";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseDetail: FC<Props> = async (props) => {
  const [getExerciseResult, getMusclesResult] = await Promise.all([
    getExerciseById({ fetcher: getFetcher() })({
      traineeId: props.traineeId,
      exerciseId: props.exerciseId,
    }),
    getAllMusclesBySession({ fetcher: getFetcher() })({
      traineeId: props.traineeId,
    }),
  ]);

  if (getExerciseResult.isErr() || getMusclesResult.isErr()) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const exercise = getExerciseResult.value;

  return (
    <ExerciseEditor
      traineeId={props.traineeId}
      exercise={exercise}
      registeredMuscles={getMusclesResult.value}
    />
  );
};
