import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllExercises } from "@/app/_actions/get-all-exercises";
import { getTrainingById } from "@/app/_actions/get-training-by-id";
import { TrainingEditingForm } from "@/app/_components/training-editing-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/");
  }

  const trainingId = props.params?.["training_id"];
  if (!trainingId) {
    const to = `/trainees/${traineeId}/trainings` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section>
      <h1>トレーニングを編集する</h1>
      <Suspense fallback={<p>データを取得しています</p>}>
        <FetchData traineeId={traineeId} trainingId={trainingId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/trainings/${trainingId}`}>
        編集をやめる
      </Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  trainingId: string;
};
const FetchData: FC<Props> = async (props) => {
  const [getTrainingResult, getExercisesResult] = await Promise.all([
    getTrainingById({
      traineeId: props.traineeId,
      trainingId: props.trainingId,
    }),
    getAllExercises({
      traineeId: props.traineeId,
    }),
  ]);

  if (getTrainingResult.isErr || getExercisesResult.isErr) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;
  const registeredExercises = getExercisesResult.value;

  return (
    <TrainingEditingForm
      traineeId={props.traineeId}
      training={training}
      registeredExercises={registeredExercises}
    />
  );
};
