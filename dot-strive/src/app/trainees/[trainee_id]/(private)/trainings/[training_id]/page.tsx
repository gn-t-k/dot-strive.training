import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

import { DeleteTraining } from "./_components/delete-training";
import { TrainingDetail } from "../_components/training-detail";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const trainingId = props.params?.["training_id"];
  if (!trainingId) {
    const to = `/trainees/${traineeId}/trainings` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>トレーニング詳細</h1>
      <Suspense
        fallback={<Loading description="トレーニングデータを取得しています" />}
      >
        <TrainingDetail traineeId={traineeId} trainingId={trainingId} />
        <Link href={`/trainees/${traineeId}/trainings/${trainingId}/edit`}>
          トレーニングを編集する
        </Link>
        <DeleteTraining traineeId={traineeId} trainingId={trainingId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/trainings`}>トレーニング一覧</Link>
    </section>
  );
};
export default Page;
