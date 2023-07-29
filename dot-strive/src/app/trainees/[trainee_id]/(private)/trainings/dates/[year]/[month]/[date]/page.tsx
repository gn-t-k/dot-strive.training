import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Loading } from "@/app/_components/loading";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { DailyTrainingList } from "./_components/daily-training-list";
import { WeeklyTrainingCalendar } from "./_components/weekly-training-calendar";
import { WeeklyTrainingCalendarClient } from "./_components/weekly-training-calendar-client";

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
  const selected = utcDateStringSchema.parse(
    new Date(`${year}-${month}-${date}`).toISOString()
  );

  return (
    <section className={stack({ direction: "column" })}>
      <div
        className={stack({
          direction: "column",
          border: "1px solid",
          w: "full",
        })}
      >
        <p>
          {year}年{month}月
        </p>
        <Suspense
          fallback={
            <WeeklyTrainingCalendarClient
              traineeId={traineeId}
              selected={selected}
              trainings={[]}
            />
          }
        >
          <WeeklyTrainingCalendar traineeId={traineeId} selected={selected} />
        </Suspense>
      </div>
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
      <Link
        href={`/trainees/${traineeId}/trainings/register?date=${year}-${month}-${date}`}
        className={css({ textAlign: "center" })}
      >
        {year}/{month}/{date}のトレーニングを登録する
      </Link>
      <Link href={`/trainees/${traineeId}/trainings/dates/${year}/${month}`}>
        {year}年{month}月のトレーニング一覧
      </Link>
    </section>
  );
};
export default Page;
