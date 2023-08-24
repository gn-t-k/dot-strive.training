import Link from "next/link";
import { redirect } from "next/navigation";

import { getAllExercises } from "@/app/_actions/get-all-exercises";
import { getTrainingById } from "@/app/_actions/get-training-by-id";
import { TrainingEditingForm } from "@/app/_components/training-editing-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/");
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
    getAllExercises({
      traineeId,
    }),
  ]);

  if (getTrainingResult.isErr || getExercisesResult.isErr) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;
  const registeredExercises = getExercisesResult.value;

  return (
    <section>
      <h1>トレーニングを編集する</h1>
      <TrainingEditingForm
        traineeId={traineeId}
        training={training}
        registeredExercises={registeredExercises}
      />
      <Link href={`/trainees/${traineeId}/trainings/${trainingId}`}>
        編集をやめる
      </Link>
    </section>
  );
};
export default Page;
