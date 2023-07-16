import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

import { DeleteExercise } from "./_components/delete-exercise";
import { ExerciseDetail } from "./_components/exercise-detail";
import { ExerciseRecords } from "../../_components/exercise-records";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const exerciseId = props.params?.["exercise_id"];
  if (!exerciseId) {
    const to = `/trainees/${traineeId}/exercises` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>種目詳細</h1>
      <Suspense fallback={<Loading description="種目データを取得しています" />}>
        <ExerciseDetail traineeId={traineeId} exerciseId={exerciseId} />
        <Link href={`/trainees/${traineeId}/exercises/${exerciseId}/edit`}>
          種目を編集する
        </Link>
        <ExerciseRecords traineeId={traineeId} exerciseId={exerciseId} />
        <DeleteExercise traineeId={traineeId} exerciseId={exerciseId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/exercises`}>種目一覧</Link>
    </section>
  );
};
export default Page;
