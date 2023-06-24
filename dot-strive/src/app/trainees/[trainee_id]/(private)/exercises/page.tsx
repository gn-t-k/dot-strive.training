import { redirect } from "next/navigation";

import { Text } from "@/libs/chakra-ui";

import { getAllExercisesBySession } from "@/features/exercise/get-all-by-session";
import { getFetcher } from "@/features/http-client/fetcher";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const exercisesResult = await getAllExercisesBySession({
    fetcher: getFetcher(),
  })({
    traineeId,
  });

  if (exercisesResult.isErr()) {
    return <Text>種目の取得に失敗しました</Text>;
  }

  return <Text>{JSON.stringify(exercisesResult.value)}</Text>;
};
export default Page;
