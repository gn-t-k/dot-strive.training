import { type FC } from "react";

import { stack } from "styled-system/patterns";

import { getMuscleById } from "../_repositories/get-muscle-by-id";

type Props = {
  traineeId: string;
  muscleId: string;
};
export const MuscleDetail: FC<Props> = async (props) => {
  const getMuscleResult = await getMuscleById({
    traineeId: props.traineeId,
    muscleId: props.muscleId,
  });
  if (getMuscleResult.isErr) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const muscle = getMuscleResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <p>{muscle.name}</p>
    </div>
  );
};
