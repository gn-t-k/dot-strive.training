import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllExercises } from "@/app/_actions/get-all-exercises";
import { getAllMuscles } from "@/app/_actions/get-all-muscles";
import { ExerciseEditingForm } from "@/app/_components/exercise-editing-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

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
    <section>
      <h1>種目の編集</h1>
      <Suspense fallback={<p>データを取得しています</p>}>
        <FetchMusclesAndExercises
          traineeId={traineeId}
          exerciseId={exerciseId}
        />
      </Suspense>
      <Link href={`/trainees/${traineeId}/exercises/${exerciseId}`}>
        編集をやめる
      </Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  exerciseId: string;
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
  if (getExercisesResult.isErr || getMusclesResult.isErr) {
    return <p>データの取得に失敗しました</p>;
  }
  const [registeredMuscles, registeredExercises] = [
    getMusclesResult.value,
    getExercisesResult.value,
  ];
  const exercise = registeredExercises.find(
    (exercise) => exercise.id === props.exerciseId
  );
  if (!exercise) {
    return <p>データの取得に失敗しました</p>;
  }

  return (
    <ExerciseEditingForm
      traineeId={props.traineeId}
      exercise={exercise}
      registeredExercises={registeredExercises}
      registeredMuscles={registeredMuscles}
    />
  );
};
