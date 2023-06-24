import Link from "next/link";

import { Stack, Text } from "@/libs/chakra-ui";

import { getFetcher } from "@/features/http-client/fetcher";
import { getAllMusclesBySession } from "@/features/muscle/get-all-by-session";

import { RegisterMuscleForm } from "./register-muscle-form";

import type { FC } from "react";

type Props = {
  traineeId: string;
};
export const MuscleList: FC<Props> = async (props) => {
  const result = await getAllMusclesBySession({
    fetcher: getFetcher(),
  })({
    traineeId: props.traineeId,
  });

  if (result.isErr()) {
    return <Text>部位データの取得に失敗しました</Text>;
  }
  const muscles = result.value;

  return (
    <Stack direction="column">
      {muscles.map((muscle) => {
        return (
          <Link
            href={`/trainees/${props.traineeId}/muscles/${muscle.id}`}
            key={muscle.id}
          >
            {muscle.name}
          </Link>
        );
      })}
      <RegisterMuscleForm
        traineeId={props.traineeId}
        registeredMuscles={muscles}
      />
    </Stack>
  );
};
