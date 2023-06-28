import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { container, stack } from "styled-system/patterns";

import { ExerciseDetail } from "./_components/exercise-detail";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  const exerciseId = props.params?.["exercise_id"];
  if (!traineeId || !exerciseId) {
    redirect("/" satisfies Route);
  }

  return (
    <main className={container()}>
      <section className={stack({ direction: "column" })}>
        <h1>種目詳細</h1>
        <Suspense
          fallback={<Loading description="種目データを取得しています" />}
        >
          <ExerciseDetail traineeId={traineeId} exerciseId={exerciseId} />
        </Suspense>
        <Link href={`/trainees/${traineeId}/exercises`}>種目一覧</Link>
      </section>
    </main>
  );
};
export default Page;
