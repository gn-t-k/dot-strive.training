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
import { none, some } from "@/app/_utils/option";
import { stack } from "styled-system/patterns";

import type { NextPage } from "@/app/_types/page";
import type { Option } from "@/app/_utils/option";
import type { Route } from "next";
import type { ComponentProps } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const view = z
    .enum(["year", "month", "week"])
    .catch("month")
    .parse(props.searchParams?.view);
  const today = new Date();
  const year = ((): number => {
    const defaultYear = getYear(today);
    const result = z.string().safeParse(props.searchParams?.year);
    const year = result.success ? Number(result.data) : defaultYear;

    return isNaN(year) ? defaultYear : year;
  })();
  const monthParam = props.searchParams?.month;
  const dayParam = props.searchParams?.day;
  const weekParam = props.searchParams?.week;

  const timezoneOffset = getTimezoneOffset();

  switch (view) {
    case "year":
      return <p>todo</p>;
    case "month": {
      const defaultMonth = getMonth(today);
      const parseMonthParamResult = z.string().safeParse(monthParam);
      const maybeMonth = parseMonthParamResult.success
        ? Number(parseMonthParamResult.data)
        : defaultMonth;
      const month = isNaN(maybeMonth) ? defaultMonth : maybeMonth;

      const day = ((): Option<number> => {
        if (dayParam === undefined) {
          return none();
        }

        const defaultDay = getDate(today);
        const parseDayParamResult = z.string().safeParse(dayParam);
        const maybeDay = parseDayParamResult.success
          ? Number(parseDayParamResult.data)
          : defaultDay;
        const day = isNaN(maybeDay) ? defaultDay : maybeDay;

        return some(day);
      })();

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
        </div>
      );
    }
    case "week": {
      const args = ((): ComponentProps<typeof Week> => {
        const common = {
          traineeId,
          timezoneOffset,
          year,
        };

        if (weekParam === undefined) {
          const defaultMonth = getMonth(today);
          const parseMonthParamResult = z.string().safeParse(monthParam);
          const maybeMonth = parseMonthParamResult.success
            ? Number(parseMonthParamResult.data)
            : defaultMonth;
          const month = isNaN(maybeMonth) ? defaultMonth : maybeMonth;

          const defaultDay = getDate(today);
          const parseDayParamResult = z.string().safeParse(dayParam);
          const maybeDay = parseDayParamResult.success
            ? Number(parseDayParamResult.data)
            : defaultDay;
          const day = isNaN(maybeDay) ? defaultDay : maybeDay;

          return {
            ...common,
            fullDate: true,
            month: some(month),
            day: some(day),
            week: none(),
          };
        }

        const defaultWeek = getWeek(today);
        const parseWeekParamResult = z.string().safeParse(weekParam);
        const maybeWeek = parseWeekParamResult.success
          ? Number(parseWeekParamResult.data)
          : defaultWeek;
        const week = isNaN(maybeWeek) ? defaultWeek : maybeWeek;

        return {
          ...common,
          fullDate: false,
          month: none(),
          day: none(),
          week: some(week),
        };
      })();

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
