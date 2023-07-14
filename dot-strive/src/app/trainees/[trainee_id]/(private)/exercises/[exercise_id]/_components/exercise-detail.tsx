import Link from "next/link";

import { stack } from "styled-system/patterns";

import { getExerciseById } from "../_repositories/get-exercise-by-id";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseDetail: FC<Props> = async (props) => {
  const getExerciseResult = await getExerciseById({
    traineeId: props.traineeId,
    exerciseId: props.exerciseId,
  });
  if (getExerciseResult.isErr()) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const exercise = getExerciseResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <p>{exercise.name}</p>
      <ul className={stack({ direction: "column" })}>
        {exercise.targets.map((target) => {
          return (
            <li key={target.id}>
              <Link href={`/trainees/${props.traineeId}/muscles/${target.id}`}>
                {target.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
