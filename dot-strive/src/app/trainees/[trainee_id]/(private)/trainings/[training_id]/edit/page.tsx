import Link from "next/link";
import { redirect } from "next/navigation";

import { container } from "styled-system/patterns";

import { EditTraining } from "./_components/edit-training";
import { getAllExercisesBySession } from "../../../_repositories/get-all-exercises-by-session";
import { getTrainingById } from "../_repositories/get-training-by-id";

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

  const [getTrainingResult, getExercisesResult] = await Promise.all([
    getTrainingById({
      traineeId,
      trainingId,
    }),
    getAllExercisesBySession({
      traineeId,
    }),
  ]);

  if (getTrainingResult.isErr() || getExercisesResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;
  const registeredExercises = getExercisesResult.value;

  return (
    <main className={container()}>
      <h1>トレーニングを編集する</h1>
      <EditTraining
        traineeId={traineeId}
        training={training}
        registeredExercises={registeredExercises}
      />
      <Link href={`/trainees/${traineeId}/trainings/${trainingId}`}>戻る</Link>
    </main>
  );
};
export default Page;
