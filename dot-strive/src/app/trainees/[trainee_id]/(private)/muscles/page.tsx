import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { container, stack } from "styled-system/patterns";

import { MuscleList } from "./_components/muscle-list";
import { RegisterMuscleForm } from "./_components/register-muscle-form";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <main className={container()}>
      <section className={stack({ direction: "column" })}>
        <h1>部位一覧</h1>
        <Suspense
          fallback={<Loading description="部位データを取得しています" />}
        >
          <MuscleList traineeId={traineeId} />
        </Suspense>
        <RegisterMuscleForm traineeId={traineeId} />
        <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
      </section>
    </main>
  );
};
export default Page;
