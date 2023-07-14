import Link from "next/link";
import { redirect } from "next/navigation";

import { EditMuscle } from "./_components/edit-muscle";
import { getAllMusclesBySession } from "../../../_repositories/get-all-muscles-by-session";
import { getMuscleById } from "../_repositories/get-muscle-by-id";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

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

  const [getMuscleResult, getMusclesResult] = await Promise.all([
    getMuscleById({
      traineeId,
      muscleId,
    }),
    getAllMusclesBySession({
      traineeId,
    }),
  ]);
  if (getMuscleResult.isErr() || getMusclesResult.isErr()) {
    return <p>部位データの取得に失敗しました</p>;
  }
  const muscle = getMuscleResult.value;
  const registeredMuscles = getMusclesResult.value;

  return (
    <section>
      <h1>部位を編集する</h1>
      <EditMuscle
        traineeId={traineeId}
        muscle={muscle}
        registeredMuscles={registeredMuscles}
      />
      <Link href={`/trainees/${traineeId}/muscles/${muscleId}`}>
        編集をやめる
      </Link>
    </section>
  );
};
export default Page;
