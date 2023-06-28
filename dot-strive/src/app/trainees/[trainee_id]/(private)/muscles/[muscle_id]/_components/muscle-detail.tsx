import { getMuscleById } from "@/app/trainees/[trainee_id]/(private)/muscles/[muscle_id]/_accessor/get-muscle-by-id";

import { MuscleEditor } from "./muscle-editor";

import type { FC } from "react";

type Props = {
  traineeId: string;
  muscleId: string;
};
export const MuscleDetail: FC<Props> = async (props) => {
  const result = await getMuscleById({
    traineeId: props.traineeId,
    muscleId: props.muscleId,
  });

  if (result.isErr()) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const muscle = result.value;

  return <MuscleEditor traineeId={props.traineeId} muscle={muscle} />;
};
