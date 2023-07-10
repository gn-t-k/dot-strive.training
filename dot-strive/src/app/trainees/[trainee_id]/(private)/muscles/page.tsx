import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

import { MuscleList } from "./_components/muscle-list";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>部位一覧</h1>
      <Suspense fallback={<Loading description="部位データを取得しています" />}>
        <MuscleList traineeId={traineeId} />
      </Suspense>
      <Link href={`/trainees/${traineeId}/muscles/register`}>
        部位を登録する
      </Link>
    </section>
  );
};
export default Page;
