import Link from "next/link";

import { getAllMuscles } from "@/app/_actions/get-all-muscles";
import { stack } from "styled-system/patterns";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const MuscleList: FC<Props> = async (props) => {
  const result = await getAllMuscles({
    traineeId: props.traineeId,
  });

  if (result.isErr) {
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
