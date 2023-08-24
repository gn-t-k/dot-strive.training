import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getTrainingById } from "@/app/_actions/get-training-by-id";
import { Loading } from "@/app/_components/loading";
import { TrainingDeleteAndConfirm } from "@/app/_components/training-delete-and-confirm";
import { TrainingDetailView } from "@/app/_components/training-detail";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

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
        <FetchTraining traineeId={traineeId} trainingId={trainingId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/trainings`}>トレーニング一覧</Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  trainingId: string;
};
const FetchTraining: FC<Props> = async (props) => {
  const getTrainingResult = await getTrainingById({
    traineeId: props.traineeId,
    trainingId: props.trainingId,
  });
  if (getTrainingResult.isErr) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingDetailView training={training} />
      <Link
        href={`/trainees/${props.traineeId}/trainings/${props.trainingId}/edit`}
      >
        トレーニングを編集する
      </Link>
      <TrainingDeleteAndConfirm
        traineeId={props.traineeId}
        training={training}
      />
    </div>
  );
};
