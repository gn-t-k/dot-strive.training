import { endOfWeek, format, startOfWeek } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { stack } from "styled-system/patterns";

import { DeleteMuscle } from "./_components/delete-muscle";
import { MuscleDetail } from "./_components/muscle-detail";

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

  const today = new Date();
  const from = startOfWeek(today);
  const to = endOfWeek(today);
  const data = await getFetcher()(
    `/api/trainees/${traineeId}/trainings/muscles/${muscleId}/dates/${format(
      from,
      "yyyy-MM-dd"
    )}/${format(to, "yyyy-MM-dd")}`
  );
  const trainings = await data.json();

  return (
    <section className={stack({ direction: "column" })}>
      <h1>部位詳細</h1>
      <p>{JSON.stringify(trainings)}</p>
      <Suspense fallback={<Loading description="部位データを取得しています" />}>
        <MuscleDetail {...{ traineeId, muscleId }} />
        <Link href={`/trainees/${traineeId}/muscles/${muscleId}/edit`}>
          部位を編集する
        </Link>
        <DeleteMuscle traineeId={traineeId} muscleId={muscleId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles`}>部位一覧</Link>
    </section>
  );
};
export default Page;
