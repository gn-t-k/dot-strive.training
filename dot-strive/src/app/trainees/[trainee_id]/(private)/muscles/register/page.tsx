import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getAllMuscles } from "@/app/_actions/get-all-muscles";
import { MuscleRegistrationForm } from "@/app/_components/muscle-registration-form";

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
      <h1>部位を登録する</h1>
      <Suspense fallback={<p>部位データを取得しています</p>}>
        <FetchMuscles traineeId={traineeId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
};
const FetchMuscles: FC<Props> = async (props) => {
  const getMusclesResult = await getAllMuscles({
    traineeId: props.traineeId,
  });
  if (getMusclesResult.isErr) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const registeredMuscles = getMusclesResult.value;

  return (
    <MuscleRegistrationForm
      traineeId={props.traineeId}
      registeredMuscles={registeredMuscles}
    />
  );
};
