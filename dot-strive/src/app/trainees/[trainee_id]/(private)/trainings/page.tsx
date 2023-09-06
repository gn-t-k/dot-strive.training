import {
  addMinutes,
  endOfMonth,
  getDate,
  getMonth,
  getWeek,
  getYear,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subMinutes,
} from "date-fns";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { getTimezoneOffset } from "@/app/_actions/get-timezone-offset";
import { getTrainingsByDateRange } from "@/app/_actions/get-trainings-by-date-range";
import { MonthView, Week, WeekView } from "@/app/_components/training-calendar";
import { TrainingDetailView } from "@/app/_components/training-detail";
import { none, some } from "@/app/_utils/option";
import { stack } from "styled-system/patterns";

import type { Training } from "@/app/_schemas/training";
import type { NextPage } from "@/app/_types/page";
import type { Option } from "@/app/_utils/option";
import type { Route } from "next";
import type { ComponentProps, FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const today = new Date();

  const view = z
    .enum(["year", "month", "week"])
    .catch("month")
    .parse(props.searchParams?.view);
  const year = z
    .preprocess((v) => Number(v), z.number().catch(getYear(today)))
    .parse(props.searchParams?.year);

  const monthParam = props.searchParams?.month;
  const dayParam = props.searchParams?.day;
  const weekParam = props.searchParams?.week;

  type GetMonthOrDefault = () => number;
  const getMonthOrDefault: GetMonthOrDefault = () => {
    const defaultMonth = getMonth(today);
    const parseMonthParamResult = z.string().safeParse(monthParam);
    const maybeMonth = parseMonthParamResult.success
      ? Number(parseMonthParamResult.data)
      : defaultMonth;

    return isNaN(maybeMonth) ? defaultMonth : maybeMonth;
  };

  type GetDayOrDefault = () => number;
  const getDayOrDefault: GetDayOrDefault = () => {
    const defaultDay = getDate(today);
    const parseDayParamResult = z.string().safeParse(dayParam);
    const maybeDay = parseDayParamResult.success
      ? Number(parseDayParamResult.data)
      : defaultDay;

    return isNaN(maybeDay) ? defaultDay : maybeDay;
  };

  type GetWeekOrDefault = () => number;
  const getWeekOrDefault: GetWeekOrDefault = () => {
    const defaultWeek = getWeek(today);
    const parseWeekParamResult = z.string().safeParse(weekParam);
    const maybeWeek = parseWeekParamResult.success
      ? Number(parseWeekParamResult.data)
      : defaultWeek;

    return isNaN(maybeWeek) ? defaultWeek : maybeWeek;
  };

  const timezoneOffset = getTimezoneOffset();

  switch (view) {
    case "year":
      return <p>todo</p>;
    case "month": {
      const month = getMonthOrDefault();
      const day = dayParam === undefined ? none() : some(getDayOrDefault());

      return (
        <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
          <MonthlyView
            year={year}
            month={month}
            day={day}
            traineeId={traineeId}
            timezoneOffset={timezoneOffset}
          />
        </Suspense>
      );
    }
    case "week": {
      const commonArgs = {
        traineeId,
        timezoneOffset,
        year,
      };
      const args: ComponentProps<typeof Week> =
        weekParam === undefined
          ? {
              ...commonArgs,
              fullDate: true,
              month: some(getMonthOrDefault()),
              day: some(getDayOrDefault()),
              week: none(),
            }
          : {
              ...commonArgs,
              fullDate: false,
              month: none(),
              day: none(),
              week: some(getWeekOrDefault()),
            };

      return (
        <div className={stack({ direction: "column" })}>
          <Suspense
            fallback={
              <WeekView
                {...{
                  ...args,
                  trainings: [],
                }}
              />
            }
          >
            <Week {...args} />
          </Suspense>
          <p>
            {args.fullDate
              ? `${year}年${args.month.value + 1}月${
                  args.day.value
                }日のトレーニング`
              : `この週のトレーニング`}
          </p>
        </div>
      );
    }
  }
};
export default Page;

type MonthlyViewProps = {
  year: number;
  month: number;
  day: Option<number>;
  traineeId: string;
  timezoneOffset: number;
};
const MonthlyView: FC<MonthlyViewProps> = async (props) => {
  const firstDayOfMonth = new Date(props.year, props.month);
  const topLeftDate = addMinutes(
    startOfWeek(firstDayOfMonth),
    props.timezoneOffset
  );
  const bottomRightDate = addMinutes(
    endOfMonth(firstDayOfMonth),
    props.timezoneOffset
  );
  const getTrainingsResult = await getTrainingsByDateRange({
    traineeId: props.traineeId,
    from: topLeftDate,
    to: bottomRightDate,
  });
  if (getTrainingsResult.isErr) {
    return <p>トレーニングの取得に失敗しました</p>;
  }
  const trainings = getTrainingsResult.value.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  type IsTrainingInMonth = (date: Date) => (training: Training) => boolean;
  const isTrainingInMonth: IsTrainingInMonth = (date) => (training) => {
    const trainingMonth = subMinutes(
      new Date(training.date),
      props.timezoneOffset
    );

    return isSameMonth(date, trainingMonth);
  };
  const trainingsInMonth = trainings.filter(
    isTrainingInMonth(new Date(props.year, props.month))
  );

  type IsTrainingInDay = (date: Date) => (training: Training) => boolean;
  const isTrainingInDay: IsTrainingInDay = (date) => (training) => {
    const trainingDay = subMinutes(
      new Date(training.date),
      props.timezoneOffset
    );

    return isSameDay(date, trainingDay);
  };
  const trainingsInDay = props.day.hasSome
    ? trainings.filter(
        isTrainingInDay(new Date(props.year, props.month, props.day.value))
      )
    : [];

  return (
    <div className={stack({ direction: "column" })}>
      <MonthView
        year={props.year}
        month={props.month}
        day={props.day}
        traineeId={props.traineeId}
        timezoneOffset={props.timezoneOffset}
        trainings={trainingsInMonth}
      />
      <p>
        {props.day.hasSome
          ? `${props.year}年${props.month + 1}月${
              props.day.value
            }日のトレーニング`
          : `${props.year}年${props.month + 1}月のトレーニング`}
      </p>
      <ul>
        {(props.day.hasSome ? trainingsInDay : trainingsInMonth).map(
          (training) => {
            return (
              <li key={training.id}>
                <TrainingDetailView training={training} />
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
};
