import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Container, Heading, Stack } from "@/libs/chakra-ui";

import { Loading } from "@/features/navigation/components/loading";

import { MuscleList } from "./_components/muscle-list";

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
        <Heading>部位一覧</Heading>
        <Suspense
          fallback={<Loading description="部位データを取得しています" />}
        >
          <MuscleList traineeId={traineeId} />
        </Suspense>
        <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
      </Stack>
    </Container>
  );
};
export default Page;
