import Link from "next/link";
import { redirect } from "next/navigation";

import { container, stack } from "styled-system/patterns";

import { getTrainingById } from "./_repositories/get-training-by-id";
import { TrainingDetail } from "../_components/training-detail";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const trainingId = props.params?.["training_id"];
  if (!trainingId) {
    const to = `/trainees/${traineeId}/trainings` as const;
    redirect(to satisfies Route<typeof to>);
  }

  const getTrainingResult = await getTrainingById({
    traineeId,
    trainingId,
  });

  if (getTrainingResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;

  return (
    <main className={container()}>
      <section className={stack({ direction: "column" })}>
        <h1>トレーニング詳細</h1>
        <TrainingDetail training={training} />
        <Link href={`/trainees/${traineeId}/trainings`}>
          トレーニングページ
        </Link>
      </section>
    </main>
  );
};
export default Page;
