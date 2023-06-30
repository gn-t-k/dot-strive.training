import Link from "next/link";
import { redirect } from "next/navigation";

import { container } from "styled-system/patterns";

import { RegisterExercise } from "./_components/register-exercise";
import { getAllMusclesBySession } from "../../_repositories/get-all-muscles-by-session";
import { getAllExercisesBySession } from "../_repositories/get-all-exercises-by-session";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];

  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const [getMusclesResult, getExercisesResult] = await Promise.all([
    getAllMusclesBySession({
      traineeId,
    }),
    getAllExercisesBySession({
      traineeId,
    }),
  ]);
  if (getMusclesResult.isErr() || getExercisesResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const registeredMuscles = getMusclesResult.value;
  const registeredExercises = getExercisesResult.value;

  return (
    <main className={container()}>
      <h1>種目を登録する</h1>
      <RegisterExercise
        traineeId={traineeId}
        registeredMuscles={registeredMuscles}
        registeredExercises={registeredExercises}
      />
      <Link href={`/trainees/${traineeId}/exercises`}>種目一覧</Link>
    </main>
  );
};
export default Page;
