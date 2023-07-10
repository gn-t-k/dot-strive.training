import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { stack } from "styled-system/patterns";

import { DailyTrainingList } from "./_components/daily-training-list";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const year = props.params?.["year"];
  const month = props.params?.["month"];
  const date = props.params?.["date"];
  if (
    !year ||
    !month ||
    !date ||
    isNaN(Date.parse(`${year}-${month}-${date}`))
  ) {
    const to = `/trainees/${traineeId}/trainings` as const;
    redirect(to satisfies Route<typeof to>);
  }

  return (
    <section className={stack({ direction: "column" })}>
      <h1>
        {year}年{month}月{date}日のトレーニング
      </h1>
      <Suspense
        fallback={<Loading description="トレーニングデータを取得しています" />}
      >
        <DailyTrainingList
          traineeId={traineeId}
          year={year}
          month={month}
          date={date}
        />
      </Suspense>
      <Link href={`/trainees/${traineeId}/trainings/dates/${year}/${month}`}>
        {year}年{month}月のトレーニング一覧
      </Link>
    </section>
  );
};
export default Page;
