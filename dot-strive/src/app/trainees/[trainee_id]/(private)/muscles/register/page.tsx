import Link from "next/link";
import { redirect } from "next/navigation";

import { getAllMuscles } from "@/app/_actions/get-all-muscles";
import { MuscleRegistrationForm } from "@/app/_components/muscle-registration-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const getMusclesResult = await getAllMuscles({
    traineeId,
  });
  if (getMusclesResult.isErr) {
    return <p>データの取得に失敗しました</p>;
  }
  const registeredMuscles = getMusclesResult.value;

  return (
    <section>
      <h1>部位を登録する</h1>
      <MuscleRegistrationForm
        traineeId={traineeId}
        registeredMuscles={registeredMuscles}
      />
      <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
    </section>
  );
};
export default Page;
