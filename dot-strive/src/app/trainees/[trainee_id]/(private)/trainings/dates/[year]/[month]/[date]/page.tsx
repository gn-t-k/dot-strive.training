import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { TrainingCalendarWeek } from "@/app/_components/training-calendar-week";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { getTraineeBySession } from "@/app/trainees/[trainee_id]/(private)/_repositories/get-trainee-by-session";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { DailyTrainingList } from "./_components/daily-training-list";
import { WeeklyTrainingCalendar } from "./_components/weekly-training-calendar";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";

const Page: NextPage = async (props) => {
  const traineeIdParam = props.params?.["trainee_id"];
  const getTraineeResult = await getTraineeBySession();
  if (
    getTraineeResult.isErr() ||
    getTraineeResult.value.id !== traineeIdParam
  ) {
    redirect("/" satisfies Route);
  }
  const traineeId = getTraineeResult.value.id;
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
            <TrainingCalendarWeek
              traineeId={traineeId}
              selected={selected}
              trainings={[]}
            />
          }
        >
          <WeeklyTrainingCalendar traineeId={traineeId} selected={selected} />
        </Suspense>
      </div>
      <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
        <DailyTrainingList traineeId={traineeId} date={selected} />
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
