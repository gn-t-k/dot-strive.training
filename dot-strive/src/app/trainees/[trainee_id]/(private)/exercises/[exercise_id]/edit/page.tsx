import Link from "next/link";
import { redirect } from "next/navigation";

import { EditExercise } from "./_components/edit-exercise";
import { getAllExercisesBySession } from "../../../_repositories/get-all-exercises-by-session";
import { getAllMusclesBySession } from "../../../_repositories/get-all-muscles-by-session";
import { getExerciseById } from "../_repositories/get-exercise-by-id";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const exerciseId = props.params?.["exercise_id"];
  if (!exerciseId) {
    const to = `/trainees/${traineeId}/exercises` as const;
    redirect(to satisfies Route<typeof to>);
  }

  const [getExerciseResult, getExercisesResult, getMusclesResult] =
    await Promise.all([
      getExerciseById({
        traineeId,
        exerciseId,
      }),
      getAllExercisesBySession({
        traineeId,
      }),
      getAllMusclesBySession({
        traineeId,
      }),
    ]);
  if (
    getExerciseResult.isErr() ||
    getExercisesResult.isErr() ||
    getMusclesResult.isErr()
  ) {
    return <p>データの取得に失敗しました</p>;
  }
  const exercise = getExerciseResult.value;
  const registeredExercises = getExercisesResult.value;
  const registeredMuscles = getMusclesResult.value;

  return (
    <section>
      <h1>種目の編集</h1>
      <EditExercise
        traineeId={traineeId}
        exercise={exercise}
        registeredExercises={registeredExercises}
        registeredMuscles={registeredMuscles}
      />
      <Link href={`/trainees/${traineeId}/exercises/${exerciseId}`}>
        編集をやめる
      </Link>
    </section>
  );
};
export default Page;
