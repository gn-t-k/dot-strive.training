import Link from "next/link";
import { redirect } from "next/navigation";

import { container } from "styled-system/patterns";

import { getAllMusclesBySession } from "../../_repositories/get-all-muscles-by-session";
import { RegisterExerciseForm } from "../_components/register-exersise-form";
import { getAllExercisesBySession } from "../_repositories/get-all-exercises-by-session";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const [getExercisesResult, getMusclesResult] = await Promise.all([
    getAllExercisesBySession({
      traineeId,
    }),
    getAllMusclesBySession({
      traineeId,
    }),
  ]);
  if (getExercisesResult.isErr() || getMusclesResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const registeredMuscles = getMusclesResult.value;

  return (
    <main className={container()}>
      <h1>種目を登録する</h1>
      <RegisterExerciseForm
        traineeId={traineeId}
        registeredExercises={getExercisesResult.value}
        registeredMuscles={registeredMuscles}
      />
      <Link href={`/trainees/${traineeId}/exercises`}>種目一覧</Link>
    </main>
  );
};
export default Page;
