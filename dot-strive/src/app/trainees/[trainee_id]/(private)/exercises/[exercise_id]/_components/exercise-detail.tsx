import { getAllMusclesBySession } from "@/app/trainees/[trainee_id]/(private)/_accessor/get-all-muscles-by-session";
import { getExerciseById } from "@/app/trainees/[trainee_id]/(private)/exercises/[exercise_id]/_accessor/get-exercise-by-id";

import { ExerciseEditor } from "./exercise-editor";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseDetail: FC<Props> = async (props) => {
  const [getExerciseResult, getMusclesResult] = await Promise.all([
    getExerciseById({
      traineeId: props.traineeId,
      exerciseId: props.exerciseId,
    }),
    getAllMusclesBySession({
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
