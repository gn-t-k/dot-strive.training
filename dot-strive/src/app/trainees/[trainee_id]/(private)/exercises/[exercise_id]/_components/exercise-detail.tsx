import { Text } from "@/libs/chakra-ui";

import { getExerciseById } from "@/features/exercise/get-by-id";
import { getFetcher } from "@/features/http-client/fetcher";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseDetail: FC<Props> = async (props) => {
  const result = await getExerciseById({ fetcher: getFetcher() })({
    traineeId: props.traineeId,
    exerciseId: props.exerciseId,
  });

  if (result.isErr()) {
    return <Text>種目データの取得に失敗しました</Text>;
  }
  const exercise = result.value;

  return <Text>{JSON.stringify(exercise)}</Text>;
};
