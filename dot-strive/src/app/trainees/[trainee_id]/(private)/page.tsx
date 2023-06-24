import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Heading, Container, Stack } from "@/libs/chakra-ui";

import { Trainee } from "@/app/trainees/[trainee_id]/(private)/_components/trainee";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { Loading } from "@/features/navigation/components/loading";

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
        <Heading>トレーニーページ</Heading>
        <Suspense
          fallback={
            <Loading description={"トレーニーデータを取得しています"} />
          }
        >
          <Trainee />
        </Suspense>
        <Link href={`/trainees/${traineeId}/muscles`}>部位</Link>
        <LogoutButton />
      </Stack>
    </Container>
  );
};
export default Page;
