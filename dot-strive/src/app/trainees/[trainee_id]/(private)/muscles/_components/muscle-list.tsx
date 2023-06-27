import Link from "next/link";

import { getAllMusclesBySession } from "@/features/muscle/get-all-by-session";
import { stack } from "styled-system/patterns";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const MuscleList: FC<Props> = async (props) => {
  const result = await getAllMusclesBySession({
    traineeId: props.traineeId,
  });

  if (result.isErr()) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const muscles = result.value;

  return (
    <ul className={stack({ direction: "column" })}>
      {muscles.map((muscle) => {
        return (
          <li key={muscle.id}>
            <Link href={`/trainees/${props.traineeId}/muscles/${muscle.id}`}>
              {muscle.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
