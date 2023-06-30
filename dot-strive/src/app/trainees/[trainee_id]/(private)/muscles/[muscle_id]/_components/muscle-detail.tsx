import { UpdateMuscle } from "./update-muscle";
import { getAllMusclesBySession } from "../../../_repositories/get-all-muscles-by-session";

import type { FC } from "react";

type Props = {
  traineeId: string;
  muscleId: string;
};
export const MuscleDetail: FC<Props> = async (props) => {
  const getAllMusclesResult = await getAllMusclesBySession({
    traineeId: props.traineeId,
  });
  if (getAllMusclesResult.isErr()) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const registeredMuscles = getAllMusclesResult.value;

  const muscle = registeredMuscles.find(
    (muscle) => muscle.id === props.muscleId
  );
  if (!muscle) {
    return <p>部位データの取得に失敗しました</p>;
  }

  return (
    <UpdateMuscle
      traineeId={props.traineeId}
      muscle={muscle}
      registeredMuscles={registeredMuscles}
    />
  );
};
