import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllMuscles } from "@/app/_actions/get-all-muscles";
import { MuscleEditingForm } from "@/app/_components/muscle-ediging-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const muscleId = props.params?.["muscle_id"];
  if (!muscleId) {
    const to = `/trainees/${traineeId}` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section>
      <h1>部位を編集する</h1>
      <Suspense fallback={<p>部位データを取得しています</p>}>
        <FetchMuscles traineeId={traineeId} muscleId={muscleId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles/${muscleId}`}>
        編集をやめる
      </Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  muscleId: string;
};
const FetchMuscles: FC<Props> = async (props) => {
  const getMusclesResult = await getAllMuscles({
    traineeId: props.traineeId,
  });
  if (getMusclesResult.isErr) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const registeredMuscles = getMusclesResult.value;
  const muscle = registeredMuscles.find(
    (muscle) => muscle.id === props.muscleId
  );
  if (!muscle) {
    return <p>部位データの取得に失敗しました</p>;
  }

  return (
    <MuscleEditingForm
      traineeId={props.traineeId}
      muscle={muscle}
      registeredMuscles={registeredMuscles}
    />
  );
};
