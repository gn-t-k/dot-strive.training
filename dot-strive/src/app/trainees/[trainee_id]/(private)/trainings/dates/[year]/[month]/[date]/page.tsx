import { addDays, addMinutes, endOfWeek, startOfWeek, subDays } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getTrainingsByDateRange } from "@/app/_actions/get-trainings-by-date-range";
import { DailyTrainingList } from "@/app/_components/daily-training-list";
import { TrainingCalendarWeek } from "@/app/_components/training-calendar-week";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import type { UTCDateString } from "@/app/_schemas/utc-date-string";
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
          <FetchWeeklyTrainings
            traineeId={traineeId}
            selected={selected}
            timezoneOffset={timezoneOffset}
          />
        </Suspense>
      </div>
      <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
        <DailyTrainingList
          traineeId={traineeId}
          date={selected}
          timezoneOffset={timezoneOffset}
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

type Props = {
  traineeId: string;
  selected: UTCDateString;
  timezoneOffset: number;
};
const FetchWeeklyTrainings: FC<Props> = async (props) => {
  const date = new Date(props.selected);
  const startDate = startOfWeek(date);
  const endDate = endOfWeek(date);
  const bufferedStartDate = subDays(startDate, 1);
  const bufferedEndDate = addDays(endDate, 1);
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
    <TrainingCalendarWeek
      traineeId={props.traineeId}
      selected={props.selected}
      trainings={trainings}
    />
  );
};
