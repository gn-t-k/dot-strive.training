import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container, Heading, Stack } from "@/libs/chakra-ui";

import { Loading } from "@/features/navigation/components/loading";

import { MuscleDetail } from "./_components/muscle-detail";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  const muscleId = props.params?.["muscle_id"];
  if (!traineeId || !muscleId) {
    redirect("/" satisfies Route);
  }

  return (
    <Container>
      <Stack direction="column">
        <Heading>部位詳細</Heading>
        <Suspense
          fallback={<Loading description="部位データを取得しています" />}
        >
          <MuscleDetail {...{ traineeId, muscleId }} />
        </Suspense>
        <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
      </Stack>
    </Container>
  );
};
export default Page;
