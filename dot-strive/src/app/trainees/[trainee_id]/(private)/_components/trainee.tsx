import { Stack, Text, Image } from "@/libs/chakra-ui";

import { getFetcher } from "@/features/http-client/fetcher";
import { getTraineeBySession } from "@/features/trainee/get-by-session";

import type { FC } from "react";

export const Trainee: FC = async () => {
  const traineeResult = await getTraineeBySession({
    fetcher: getFetcher(),
  })();

  if (traineeResult.isErr()) {
    return <Text>データの検証に失敗しました</Text>;
  }

  const trainee = traineeResult.value;

  return (
    <Stack direction="column">
      <Text>id: {trainee.id}</Text>
      <Text>name: {trainee.name}</Text>
      <Image src={trainee.image} alt={trainee.name} />
    </Stack>
  );
};
