import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

import { DeleteMuscle } from "./_components/delete-muscle";
import { MuscleDetail } from "./_components/muscle-detail";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const muscleId = props.params?.["muscle_id"];
  if (!muscleId) {
    const to = `/trainees/${traineeId}/muscles` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>部位詳細</h1>
      <Suspense fallback={<Loading description="部位データを取得しています" />}>
        <MuscleDetail {...{ traineeId, muscleId }} />
        <Link href={`/trainees/${traineeId}/muscles/${muscleId}/edit`}>
          部位を編集する
        </Link>
        <DeleteMuscle traineeId={traineeId} muscleId={muscleId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
    </section>
  );
};
export default Page;
