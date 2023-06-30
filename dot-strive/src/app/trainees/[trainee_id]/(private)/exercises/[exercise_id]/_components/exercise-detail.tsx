import { getAllMusclesBySession } from "@/app/trainees/[trainee_id]/(private)/_repositories/get-all-muscles-by-session";
import { getAllExercisesBySession } from "@/app/trainees/[trainee_id]/(private)/exercises/_repositories/get-all-exercises-by-session";

import { UpdateExercise } from "./update-exercise";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseDetail: FC<Props> = async (props) => {
  const [getExercisesResult, getMusclesResult] = await Promise.all([
    getAllExercisesBySession({
      traineeId: props.traineeId,
    }),
    getAllMusclesBySession({
      traineeId: props.traineeId,
    }),
  ]);

  if (getExercisesResult.isErr() || getMusclesResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const registeredExercises = getExercisesResult.value;
  const registeredMuscles = getMusclesResult.value;

  const exercise = registeredExercises.find(
    (exercise) => exercise.id === props.exerciseId
  );
  if (!exercise) {
    return <p>種目の取得に失敗しました</p>;
  }

  return (
    <UpdateExercise
      traineeId={props.traineeId}
      exercise={exercise}
      registeredMuscles={registeredMuscles}
      registeredExercises={registeredExercises}
    />
  );
};
