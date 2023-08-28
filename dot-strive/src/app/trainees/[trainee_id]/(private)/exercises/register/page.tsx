import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllExercises } from "@/app/_actions/get-all-exercises";
import { getAllMuscles } from "@/app/_actions/get-all-muscles";

import { ExerciseRegistrationForm } from "../../../../../_components/exercise-registration-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];

  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <section>
      <h1>種目を登録する</h1>
      <Suspense fallback={<p>データを取得しています</p>}>
        <FetchMusclesAndExercises traineeId={traineeId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
};
const FetchMusclesAndExercises: FC<Props> = async (props) => {
  const [getMusclesResult, getExercisesResult] = await Promise.all([
    getAllMuscles({
      traineeId: props.traineeId,
    }),
    getAllExercises({
      traineeId: props.traineeId,
    }),
  ]);
  if (getMusclesResult.isErr || getExercisesResult.isErr) {
    return <p>データの取得に失敗しました</p>;
  }
  const registeredMuscles = getMusclesResult.value;
  const registeredExercises = getExercisesResult.value;

  return (
    <ExerciseRegistrationForm
      traineeId={props.traineeId}
      registeredMuscles={registeredMuscles}
      registeredExercises={registeredExercises}
    />
  );
};
