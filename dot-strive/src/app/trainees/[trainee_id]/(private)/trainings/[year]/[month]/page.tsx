import { addMonths, subMonths } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { container, stack } from "styled-system/patterns";

import { MonthlyTrainingList } from "./_components/monthly-training-list";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }
  const year = props.params?.["year"];
  const month = props.params?.["month"];
  if (!year || !month || isNaN(Date.parse(`${year}-${month}`))) {
    const to = `/trainees/${traineeId}/trainings` as const;
    redirect(to satisfies Route<typeof to>);
  }

  const thisMonthDate = new Date(`${year}-${month}`);
  const nextMonthDate = addMonths(thisMonthDate, 1);
  const nextMonthYear = nextMonthDate.getFullYear();
  const nextMonthMonth = nextMonthDate.getMonth() + 1;
  const prevMonthDate = subMonths(thisMonthDate, 1);
  const prevMonthYear = prevMonthDate.getFullYear();
  const prevMonthMonth = prevMonthDate.getMonth() + 1;

  return (
    <main className={container()}>
      <section className={stack({ direction: "column" })}>
        <h1>
          {year}年{month}月のトレーニング一覧
        </h1>
        <div className={stack({ direction: "row" })}>
          <Link
            href={`/trainees/${traineeId}/trainings/${prevMonthYear}/${prevMonthMonth}`}
          >
            {prevMonthYear}年{prevMonthMonth}月
          </Link>
          <Link
            href={`/trainees/${traineeId}/trainings/${nextMonthYear}/${nextMonthMonth}`}
          >
            {nextMonthYear}年{nextMonthMonth}月
          </Link>
        </div>
        <Suspense
          fallback={
            <Loading description="トレーニングデータを取得しています" />
          }
        >
          <MonthlyTrainingList
            traineeId={traineeId}
            year={year}
            month={month}
          />
        </Suspense>
        <Link href={`/trainees/${traineeId}`}>トレーニーページ</Link>
      </section>
    </main>
  );
};
export default Page;
