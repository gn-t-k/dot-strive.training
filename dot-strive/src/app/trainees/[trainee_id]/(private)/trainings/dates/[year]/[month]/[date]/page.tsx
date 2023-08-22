import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DailyTrainingList } from "@/app/_components/daily-training-list";
import { TrainingCalendarWeek } from "@/app/_components/training-calendar-week";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { getTraineeBySession } from "@/app/trainees/[trainee_id]/(private)/_repositories/get-trainee-by-session";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { getWeeklyTrainings } from "./_repository/get-weekly-trainings";

import type { TraineeId } from "@/app/_schemas/trainee";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

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
          <FetchWeeklyTrainings traineeId={traineeId} selected={selected} />
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
  traineeId: TraineeId;
  selected: UTCDateString;
};
const FetchWeeklyTrainings: FC<Props> = async (props) => {
  const result = await getWeeklyTrainings({
    traineeId: props.traineeId,
    date: props.selected,
  });
  if (result.isErr()) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = result.value;

  return (
    <TrainingCalendarWeek
      traineeId={props.traineeId}
      selected={props.selected}
      trainings={trainings}
    />
  );
};
