import { Text } from "@/libs/chakra-ui";

import { getFetcher } from "@/features/http-client/fetcher";
import { getMuscleById } from "@/features/muscle/get-by-id";

import { MuscleEditor } from "./muscle-editor";

import type { FC } from "react";

type Props = {
  traineeId: string;
  muscleId: string;
};
export const MuscleDetail: FC<Props> = async (props) => {
  const result = await getMuscleById({ fetcher: getFetcher() })({
    traineeId: props.traineeId,
    muscleId: props.muscleId,
  });

  if (result.isErr()) {
    return <Text>部位データの取得に失敗しました</Text>;
  }
  const muscle = result.value;

  return <MuscleEditor traineeId={props.traineeId} muscle={muscle} />;
};
