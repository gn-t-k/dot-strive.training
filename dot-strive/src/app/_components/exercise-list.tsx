import Link from "next/link";

import { getAllExercises } from "@/app/_actions/get-all-exercises";
import { stack } from "styled-system/patterns";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const ExerciseList: FC<Props> = async (props) => {
  const exercisesResult = await getAllExercises({
    traineeId: props.traineeId,
  });

  if (exercisesResult.isErr) {
    return <p>種目の取得に失敗しました</p>;
  }
  const exercises = exercisesResult.value;

  return (
    <ul className={stack({ direction: "column" })}>
      {exercises.map((exercise) => {
        return (
          <li key={exercise.id}>
            <Link
              href={`/trainees/${props.traineeId}/exercises/${exercise.id}`}
              key={exercise.id}
            >
              {exercise.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
