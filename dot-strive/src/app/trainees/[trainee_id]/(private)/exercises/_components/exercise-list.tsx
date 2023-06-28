import Link from "next/link";

import { getAllExercisesBySession } from "@/app/trainees/[trainee_id]/(private)/exercises/_repositories/get-all-exercises-by-session";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const ExerciseList: FC<Props> = async (props) => {
  const exercisesResult = await getAllExercisesBySession({
    traineeId: props.traineeId,
  });

  if (exercisesResult.isErr()) {
    return <p>種目の取得に失敗しました</p>;
  }
  const exercises = exercisesResult.value;

  return exercises.map((exercise) => {
    return (
      <Link
        href={`/trainees/${props.traineeId}/exercises/${exercise.id}`}
        key={exercise.id}
      >
        {exercise.name}
      </Link>
    );
  });
};
