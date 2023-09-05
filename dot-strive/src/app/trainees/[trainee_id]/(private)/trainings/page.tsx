import { getDate, getMonth, getWeek, getYear } from "date-fns";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { getTimezoneOffset } from "@/app/_actions/get-timezone-offset";
import {
  Month,
  MonthView,
  Week,
  WeekView,
} from "@/app/_components/training-calendar";
import { TrainingListDay } from "@/app/_components/training-list-day";
import { TrainingListMonth } from "@/app/_components/training-list-month";
import { none, some } from "@/app/_utils/option";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { ComponentProps } from "react";

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
        <div className={stack({ direction: "column" })}>
          <Suspense
            fallback={
              <MonthView
                year={year}
                month={month}
                day={day}
                traineeId={traineeId}
                timezoneOffset={timezoneOffset}
                trainings={[]}
              />
            }
          >
            <Month
              year={year}
              month={month}
              day={day}
              traineeId={traineeId}
              timezoneOffset={timezoneOffset}
            />
          </Suspense>
          <p>
            {day.hasSome
              ? `${year}年${month + 1}月${day.value}日のトレーニング`
              : `${year}年${month + 1}月のトレーニング`}
          </p>
          {day.hasSome ? (
            <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
              <TrainingListDay
                year={year}
                month={month}
                day={day.value}
                traineeId={traineeId}
                timezoneOffset={timezoneOffset}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
              <TrainingListMonth
                year={year}
                month={month}
                day={day}
                traineeId={traineeId}
                timezoneOffset={timezoneOffset}
              />
            </Suspense>
          )}
        </div>
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
