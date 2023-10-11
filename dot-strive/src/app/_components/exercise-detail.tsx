import Link from "next/link";

import { getExerciseById } from "@/app/_actions/get-exercise-by-id";
import { stack } from "styled-system/patterns";

import { getEstimatedMaximumWeight } from "../_actions/get-estimated-maximam-weight";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseDetail: FC<Props> = async (props) => {
  const [getExerciseResult, get1RMResult] = await Promise.all([
    getExerciseById({
      traineeId: props.traineeId,
      exerciseId: props.exerciseId,
    }),
    await getEstimatedMaximumWeight({
      traineeId: props.traineeId,
      exerciseId: props.exerciseId,
    }),
  ]);
  if (getExerciseResult.isErr) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const exercise = getExerciseResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <p>{exercise.name}</p>
      <ul className={stack({ direction: "column", pl: 4 })}>
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
      {get1RMResult.isOk && get1RMResult.value.hasSome && (
        <p>
          推定最大1RM: {get1RMResult.value.value.estimatedMaximumWeight}kg（
          {
            <Link
              href={`/trainees/${props.traineeId}/trainings/${get1RMResult.value.value.training.id}`}
            >
              {new Date(
                get1RMResult.value.value.training.date
              ).toLocaleDateString("ja")}
              の記録
            </Link>
          }
          ）
        </p>
      )}
    </div>
  );
};
