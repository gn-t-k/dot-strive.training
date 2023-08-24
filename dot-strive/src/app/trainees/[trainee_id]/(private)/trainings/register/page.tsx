import Link from "next/link";
import { redirect } from "next/navigation";

import { TrainingRegistrationForm } from "@/app/_components/training-registration-form";
import { getAllExercisesBySession } from "@/app/trainees/[trainee_id]/(private)/_repositories/get-all-exercises-by-session";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];

  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const getExercisesResult = await getAllExercisesBySession({
    traineeId,
  });
  if (getExercisesResult.isErr) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const registeredExercises = getExercisesResult.value;

  return (
    <section className={stack({ direction: "column" })}>
      <h1>トレーニングを登録</h1>
      <TrainingRegistrationForm
        traineeId={traineeId}
        registeredExercises={registeredExercises}
      />
      <Link href={`/trainees/${traineeId}/trainings`}>トレーニング一覧</Link>
    </section>
  );
};
export default Page;
