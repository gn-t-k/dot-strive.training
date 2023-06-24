import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container, Heading, Stack } from "@/libs/chakra-ui";

import { Loading } from "@/features/navigation/components/loading";

import { ExerciseDetail } from "./_components/exercise-detail";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  const exerciseId = props.params?.["exercise_id"];
  if (!traineeId || !exerciseId) {
    redirect("/" satisfies Route);
  }

  return (
    <Container>
      <Stack direction="column">
        <Heading>種目詳細</Heading>
        <Suspense
          fallback={<Loading description="種目データを取得しています" />}
        >
          <ExerciseDetail traineeId={traineeId} exerciseId={exerciseId} />
        </Suspense>
        <Link href={`/trainees/${traineeId}/exercises`}>種目一覧</Link>
      </Stack>
    </Container>
  );
};
export default Page;
