import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getMuscleById } from "@/app/_actions/get-muscle-by-id";
import { Loading } from "@/app/_components/loading";
import { MuscleDeletionAndConfirm } from "@/app/_components/muscle-deletion-and-confirm";
import { MuscleDetail } from "@/app/_components/muscle-detail";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const muscleId = props.params?.["muscle_id"];
  if (!muscleId) {
    const to = `/trainees/${traineeId}/muscles` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>部位詳細</h1>
      <Suspense fallback={<Loading description="部位データを取得しています" />}>
        <FetchMuscle traineeId={traineeId} muscleId={muscleId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  muscleId: string;
};
const FetchMuscle: FC<Props> = async (props) => {
  const getMuscleResult = await getMuscleById({
    traineeId: props.traineeId,
    muscleId: props.muscleId,
  });
  if (getMuscleResult.isErr) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const muscle = getMuscleResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <MuscleDetail muscle={muscle} />
      <Link
        href={`/trainees/${props.traineeId}/muscles/${props.muscleId}/edit`}
      >
        部位を編集する
      </Link>
      <MuscleDeletionAndConfirm traineeId={props.traineeId} muscle={muscle} />
    </div>
  );
};
