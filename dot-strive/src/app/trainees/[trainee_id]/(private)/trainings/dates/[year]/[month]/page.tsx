import {
  addDays,
  addMinutes,
  addMonths,
  endOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getTrainingsByDateRange } from "@/app/_actions/get-trainings-by-date-range";
import { Loading } from "@/app/_components/loading";
import { TrainingCalendarMonth } from "@/app/_components/training-calendar-month";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { TrainingDetailView } from "../../../_components/training-detail";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = async (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/");
  }

  const clientTimezoneOffsetParam =
    props.searchParams?.["client_timezone_offset"];
  const clientTimezoneOffset = ((): number => {
    const number = Number(clientTimezoneOffsetParam);

    return isNaN(number) ? 0 : number;
  })();
  const serverTimezoneOffset = new Date().getTimezoneOffset();
  const timezoneOffset = clientTimezoneOffset - serverTimezoneOffset;

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
    <section className={stack({ direction: "column" })}>
      <h1 className={css({ textAlign: "center" })}>
        {year}年{month}月のトレーニング一覧
      </h1>
      <div className={stack({ direction: "row", justify: "space-between" })}>
        <Link
          href={`/trainees/${traineeId}/trainings/dates/${prevMonthYear}/${prevMonthMonth}`}
        >
          {prevMonthYear}年{prevMonthMonth}月
        </Link>
        <Link
          href={`/trainees/${traineeId}/trainings/dates/${nextMonthYear}/${nextMonthMonth}`}
        >
          {nextMonthYear}年{nextMonthMonth}月
        </Link>
      </div>
      <Suspense
        fallback={<Loading description="トレーニングデータを取得しています" />}
      >
        <FetchMonthlyTrainings
          traineeId={traineeId}
          year={year}
          month={month}
          timezoneOffset={timezoneOffset}
        />
      </Suspense>
    </section>
  );
};
export default Page;

type Props = {
  traineeId: string;
  year: string;
  month: string;
  timezoneOffset: number;
};
const FetchMonthlyTrainings: FC<Props> = async (props) => {
  const startDate = new Date(`${props.year}-${props.month}`);
  const endDate = endOfMonth(startDate);
  const bufferedStartDate = subDays(startDate, 7);
  const bufferedEndDate = addDays(endDate, 7);
  const offsetStartOfDate = addMinutes(bufferedStartDate, props.timezoneOffset);
  const offsetEndOfDate = addMinutes(bufferedEndDate, props.timezoneOffset);

  const getTrainingsResult = await getTrainingsByDateRange({
    traineeId: props.traineeId,
    from: offsetStartOfDate,
    to: offsetEndOfDate,
  });
  if (getTrainingsResult.isErr()) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = getTrainingsResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingCalendarMonth
        traineeId={props.traineeId}
        trainings={trainings}
        selected={utcDateStringSchema.parse(
          new Date(`${props.year}-${props.month}-1`).toISOString()
        )}
      />
      <ul className={stack({ direction: "column", gap: 12, p: 4 })}>
        {trainings
          .sort(
            (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
          )
          .map((training) => {
            const styles = css({
              border: "1px solid",
            });

            return (
              <li key={training.id} className={styles}>
                <Link
                  href={`/trainees/${props.traineeId}/trainings/${training.id}`}
                >
                  <TrainingDetailView training={training} />
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
