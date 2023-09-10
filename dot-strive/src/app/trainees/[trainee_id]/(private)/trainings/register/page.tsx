import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllExercises } from "@/app/_actions/get-all-exercises";
import { TrainingRegistrationForm } from "@/app/_components/training-registration-form";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];

  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const trainingDateParams = props.searchParams?.["training_date"];
  const trainingDate = trainingDateParams
    ? Number(trainingDateParams)
    : new Date().getTime();

  return (
    <section className={stack({ direction: "column" })}>
      <h1>トレーニングを登録</h1>
      <Suspense fallback={<p>種目データを取得しています</p>}>
        <FetchExercises traineeId={traineeId} trainingDate={trainingDate} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/trainings`}>トレーニング一覧</Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  trainingDate: number;
};
const FetchExercises: FC<Props> = async (props) => {
  const getExercisesResult = await getAllExercises({
    traineeId: props.traineeId,
  });
  if (getExercisesResult.isErr) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const registeredExercises = getExercisesResult.value;

  return (
    <TrainingRegistrationForm
      traineeId={props.traineeId}
      registeredExercises={registeredExercises}
      trainingDate={props.trainingDate}
    />
  );
};
