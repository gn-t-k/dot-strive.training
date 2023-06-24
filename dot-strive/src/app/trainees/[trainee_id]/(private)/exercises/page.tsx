import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container, Heading, Stack } from "@/libs/chakra-ui";

import { Loading } from "@/features/navigation/components/loading";

import { ExerciseList } from "./_components/exercise-list";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <Container>
      <Stack direction="column">
        <Heading>種目一覧</Heading>
        <Suspense
          fallback={<Loading description="種目データを取得しています" />}
        >
          <ExerciseList traineeId={traineeId} />
        </Suspense>
        <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
      </Stack>
    </Container>
  );
};
export default Page;
