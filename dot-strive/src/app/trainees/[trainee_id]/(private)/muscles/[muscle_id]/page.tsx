import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

import { MuscleDetail } from "./_components/muscle-detail";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  const muscleId = props.params?.["muscle_id"];
  if (!traineeId || !muscleId) {
    redirect("/" satisfies Route);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>部位詳細</h1>
      <Suspense fallback={<Loading description="部位データを取得しています" />}>
        <MuscleDetail {...{ traineeId, muscleId }} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
    </section>
  );
};
export default Page;
