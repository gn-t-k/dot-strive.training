import Link from "next/link";

import { getAllExercisesBySession } from "@/features/exercise/get-all-by-session";
import { getFetcher } from "@/features/http-client/fetcher";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const ExerciseList: FC<Props> = async (props) => {
  const exercisesResult = await getAllExercisesBySession({
    fetcher: getFetcher(),
  })({
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
