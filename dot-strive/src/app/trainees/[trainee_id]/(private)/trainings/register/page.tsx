import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { getAllExercisesBySession } from "@/app/trainees/[trainee_id]/(private)/_repositories/get-all-exercises-by-session";
import { container, stack } from "styled-system/patterns";

import { RegisterTraining } from "./_components/register-training";

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
  if (getExercisesResult.isErr()) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const registeredExercises = getExercisesResult.value;

  return (
    <main className={container()}>
      <section className={stack({ direction: "column" })}>
        <h1>トレーニングを登録</h1>
        <Suspense
          fallback={<Loading description="種目データを取得しています" />}
        >
          <RegisterTraining
            traineeId={traineeId}
            registeredExercises={registeredExercises}
          />
        </Suspense>
        <Link href={`/trainees/${traineeId}/trainings`}>
          トレーニングページ
        </Link>
      </section>
    </main>
  );
};
export default Page;
