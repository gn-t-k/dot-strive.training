import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { container, stack } from "styled-system/patterns";

import { ExerciseList } from "./_components/exercise-list";

import type { NextPage } from "@/app/_utils/types";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <main className={container()}>
      <section className={stack({ direction: "column" })}>
        <h1>種目一覧</h1>
        <Suspense
          fallback={<Loading description="種目データを取得しています" />}
        >
          <ExerciseList traineeId={traineeId} />
        </Suspense>
        <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
      </section>
    </main>
  );
};
export default Page;
