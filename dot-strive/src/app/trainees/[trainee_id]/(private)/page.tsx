import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ExerciseList } from "@/app/_components/exercise-list";
import { Loading } from "@/app/_components/loading";
import { LogoutButton } from "@/app/_components/logout-button";
import { MuscleList } from "@/app/_components/muscle-list";
import { Trainee } from "@/app/_components/trainee";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <Suspense
        fallback={<Loading description={"トレーニーデータを取得しています"} />}
      >
        <Trainee />
      </Suspense>
      <LogoutButton />
      <section>
        <div className={stack({ direction: "row", justify: "space-between" })}>
          <h2>種目</h2>
          <Link href={`/trainees/${traineeId}/exercises/register`}>
            種目を追加
          </Link>
        </div>
        <Suspense
          fallback={<Loading description="種目データを取得しています" />}
        >
          <ExerciseList traineeId={traineeId} />
        </Suspense>
      </section>
      <section>
        <div className={stack({ direction: "row", justify: "space-between" })}>
          <h2>部位</h2>
          <Link href={`/trainees/${traineeId}/muscles/register`}>
            部位を追加
          </Link>
        </div>
        <Suspense
          fallback={<Loading description="部位データを取得しています" />}
        >
          <MuscleList traineeId={traineeId} />
        </Suspense>
      </section>
    </section>
  );
};
export default Page;
