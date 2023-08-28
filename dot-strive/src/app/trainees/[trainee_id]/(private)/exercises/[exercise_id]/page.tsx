import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getExerciseById } from "@/app/_actions/get-exercise-by-id";
import { ExerciseDeletionAndConfirm } from "@/app/_components/exercise-deletion-and-confirm";
import { ExerciseDetail } from "@/app/_components/exercise-detail";
import { ExerciseRecords } from "@/app/_components/exercise-records";
import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

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
    const to = `/trainees/${traineeId}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>種目詳細</h1>
      <Suspense fallback={<Loading description="種目データを取得しています" />}>
        <ExerciseDetail traineeId={traineeId} exerciseId={exerciseId} />
        <Link href={`/trainees/${traineeId}/exercises/${exerciseId}/edit`}>
          種目を編集する
        </Link>
        <ExerciseRecords traineeId={traineeId} exerciseId={exerciseId} />
        <FetchExercise traineeId={traineeId} exerciseId={exerciseId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  exerciseId: string;
};
const FetchExercise: FC<Props> = async (props) => {
  const result = await getExerciseById({
    traineeId: props.traineeId,
    exerciseId: props.exerciseId,
  });
  if (result.isErr) {
    return <p>種目データの取得に失敗しました</p>;
  }
  const exercise = result.value;

  return (
    <ExerciseDeletionAndConfirm
      traineeId={props.traineeId}
      exercise={exercise}
    />
  );
};
