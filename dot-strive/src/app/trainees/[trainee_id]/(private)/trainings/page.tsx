import {
  addMinutes,
  endOfMonth,
  endOfWeek,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subMinutes,
} from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { getTimezoneOffset } from "@/app/_actions/get-timezone-offset";
import { getTrainingsByDateRange } from "@/app/_actions/get-trainings-by-date-range";
import * as TrainingCalendar from "@/app/_components/training-calendar";
import { TrainingCalendarViewSwitcher } from "@/app/_components/training-calendar-view-switcher";
import { TrainingDetail } from "@/app/_components/training-detail";
import {
  calendarSchema,
  changeViewToMonth,
  changeViewToWeek,
  getDateFromCalendar,
  getDateFromWeek,
  getNextMonth,
  getNextWeek,
  getPrevMonth,
  getPrevWeek,
  getSearchParams,
} from "@/app/_schemas/calendar";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import type { Calendar } from "@/app/_schemas/calendar";
import type { Training } from "@/app/_schemas/training";
import type { NextPage } from "@/app/_types/page";
import type { FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/");
  }

  const monthParam = props.searchParams?.month;
  const dayParam = props.searchParams?.day;
  const weekParam = props.searchParams?.week;

  const timezoneOffset = getTimezoneOffset();

  const today = subMinutes(new Date(), timezoneOffset).getTime();

  const defaultView: Calendar["view"] = "month" as const;
  const defaultYear = getYear(today);
  const defaultMonth = getMonth(today);

  const view = z
    .enum(["year", "month", "week"])
    .catch(defaultView)
    .parse(props.searchParams?.view);

  const parseCalendarResult = calendarSchema.safeParse({
    view,
    year: z
      .preprocess((v) => Number(v), z.number().catch(getYear(today)))
      .parse(props.searchParams?.year),
    month: monthParam === undefined ? undefined : Number(monthParam),
    day: dayParam === undefined ? undefined : Number(dayParam),
    week: weekParam === undefined ? undefined : Number(weekParam),
  });
  if (!parseCalendarResult.success) {
    const searchParams = new URLSearchParams([
      ["year", String(defaultYear)],
      ["month", String(defaultMonth)],
      ["view", String(defaultView)],
    ]);
    redirect(`/trainees/${traineeId}/trainings/?${searchParams.toString()}`);
  }
  const calendar = parseCalendarResult.data;

  switch (view) {
    case "year":
      return <p>todo</p>;
    case "month": {
      const monthCalendar = changeViewToMonth(calendar);
      const [prevMonthCalendar, nextMonthCalendar] = [
        getPrevMonth(monthCalendar),
        getNextMonth(monthCalendar),
      ];
      const baseHref = `/trainees/${traineeId}/trainings/` as const;
      const prevMonthHref = `${baseHref}?${getSearchParams(
        prevMonthCalendar
      ).toString()}` as const;
      const nextMonthHref = `${baseHref}?${getSearchParams(
        nextMonthCalendar
      ).toString()}` as const;

      return (
        <div className={stack({ direction: "column" })}>
          <div
            className={css({
              w: "full",
              px: "16px",
              justifyContent: "center",
            })}
          >
            <TrainingCalendarViewSwitcher
              traineeId={traineeId}
              calendar={monthCalendar}
            />
          </div>
          <div
            className={stack({ direction: "row", justify: "space-between" })}
          >
            <Link href={prevMonthHref}>
              {"<"} {String(prevMonthCalendar.month + 1).padStart(2, "0")}
            </Link>
            <p>
              {monthCalendar.year}.
              {String(monthCalendar.month + 1).padStart(2, "0")}
            </p>
            <Link href={nextMonthHref}>
              {String(nextMonthCalendar.month + 1).padStart(2, "0")} {">"}
            </Link>
          </div>
          <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
            <MonthlyView
              traineeId={traineeId}
              timezoneOffset={timezoneOffset}
              calendar={monthCalendar}
            />
          </Suspense>
        </div>
      );
    }
    case "week": {
      const weekCalendar = changeViewToWeek(calendar);
      const [prevWeekCalendar, nextWeekCalendar] = [
        getPrevWeek(weekCalendar),
        getNextWeek(weekCalendar),
      ];

      const sunday =
        weekCalendar.week === undefined
          ? startOfWeek(getDateFromCalendar(weekCalendar)).getTime()
          : getDateFromWeek(weekCalendar);
      const [sundayYear, sundayMonth, sundayDay] = [
        getYear(sunday),
        getMonth(sunday),
        getDate(sunday),
      ];
      const saturday = endOfWeek(sunday).getTime();
      const [saturdayYear, saturdayMonth, saturdayDay] = [
        getYear(saturday),
        getMonth(saturday),
        getDate(saturday),
      ];

      const baseHref = `/trainees/${traineeId}/trainings/` as const;
      const prevWeekHref = `${baseHref}?${getSearchParams(
        prevWeekCalendar
      ).toString()}` as const;
      const nextWeekHref = `${baseHref}?${getSearchParams(
        nextWeekCalendar
      ).toString()}` as const;

      return (
        <div className={stack({ direction: "column" })}>
          <div
            className={css({
              w: "full",
              px: "16px",
              justifyContent: "center",
            })}
          >
            <TrainingCalendarViewSwitcher
              traineeId={traineeId}
              calendar={weekCalendar}
            />
          </div>
          <div
            className={stack({ direction: "row", justify: "space-between" })}
          >
            <Link href={prevWeekHref}>{"<"}</Link>
            <p>
              {sundayYear}.{String(sundayMonth + 1).padStart(2, "0")}.
              {String(sundayDay).padStart(2, "0")}~
              {sundayYear === saturdayYear ? "" : `${saturdayYear}.`}
              {sundayMonth === saturdayMonth
                ? ""
                : `${String(saturdayMonth + 1).padStart(2, "0")}.`}
              {String(saturdayDay).padStart(2, "0")}
            </p>
            <Link href={nextWeekHref}>{">"}</Link>
          </div>
          <Suspense fallback={<p>トレーニングデータを取得しています</p>}>
            <WeeklyView
              traineeId={traineeId}
              timezoneOffset={timezoneOffset}
              calendar={weekCalendar}
            />
          </Suspense>
        </div>
      );
    }
  }
};
export default Page;

type MonthlyViewProps = {
  calendar: Extract<Calendar, { view: "month" }>;
  traineeId: string;
  timezoneOffset: number;
};
const MonthlyView: FC<MonthlyViewProps> = async (props) => {
  const firstDayOfMonth = new Date(
    props.calendar.year,
    props.calendar.month
  ).getTime();
  const topLeftDate = addMinutes(
    startOfWeek(firstDayOfMonth).getTime(),
    props.timezoneOffset
  ).getTime();
  const bottomRightDate = addMinutes(
    endOfWeek(endOfMonth(firstDayOfMonth)).getTime(),
    props.timezoneOffset
  ).getTime();
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

  type IsTrainingInMonth = (date: number) => (training: Training) => boolean;
  const isTrainingInMonth: IsTrainingInMonth = (date) => (training) => {
    const trainingMonth = subMinutes(
      new Date(training.date).getTime(),
      props.timezoneOffset
    ).getTime();

    return isSameMonth(date, trainingMonth);
  };
  const trainingsInMonth = trainings.filter(
    isTrainingInMonth(
      new Date(props.calendar.year, props.calendar.month).getTime()
    )
  );

  type IsTrainingInDay = (date: number) => (training: Training) => boolean;
  const isTrainingInDay: IsTrainingInDay = (date) => (training) => {
    const trainingDay = subMinutes(
      new Date(training.date).getTime(),
      props.timezoneOffset
    );

    return isSameDay(date, trainingDay);
  };
  const trainingsInDay =
    props.calendar.day !== undefined
      ? trainings.filter(isTrainingInDay(getDateFromCalendar(props.calendar)))
      : [];

  const baseHref = `/trainees/${props.traineeId}/trainings/` as const;

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingCalendar.Month
        traineeId={props.traineeId}
        timezoneOffset={props.timezoneOffset}
        trainings={trainings}
        calendar={props.calendar}
      />
      {props.calendar.day !== undefined ? (
        <>
          <p>
            {props.calendar.year}年{props.calendar.month + 1}月
            {props.calendar.day}日のトレーニング
          </p>
          <ul>
            {trainingsInDay.map((training) => {
              return (
                <Link href={`${baseHref}/${training.id}`} key={training.id}>
                  <li>
                    <TrainingDetail training={training} />
                  </li>
                </Link>
              );
            })}
          </ul>
          <Link
            href={`/trainees/${
              props.traineeId
            }/trainings/register?training_date=${getDateFromCalendar(
              props.calendar
            )}`}
          >
            トレーニングを登録する
          </Link>
        </>
      ) : (
        <>
          <p>
            {props.calendar.year}年{props.calendar.month + 1}月のトレーニング
          </p>
          <ul>
            {trainingsInMonth.map((training) => {
              return (
                <Link href={`${baseHref}/${training.id}`} key={training.id}>
                  <li>
                    <TrainingDetail training={training} />
                  </li>
                </Link>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

type WeeklyViewProps = {
  traineeId: string;
  timezoneOffset: number;
  calendar: Extract<Calendar, { view: "week" }>;
};
const WeeklyView: FC<WeeklyViewProps> = async (props) => {
  const sunday =
    props.calendar.week === undefined
      ? getDateFromCalendar(props.calendar)
      : getDateFromWeek(props.calendar);
  const [startOfSunday, endOfSaturday] = [
    addMinutes(startOfWeek(sunday).getTime(), props.timezoneOffset).getTime(),
    addMinutes(endOfWeek(sunday).getTime(), props.timezoneOffset).getTime(),
  ];
  const getTrainingsResult = await getTrainingsByDateRange({
    traineeId: props.traineeId,
    from: startOfSunday,
    to: endOfSaturday,
  });
  if (getTrainingsResult.isErr) {
    return <p>トレーニングの取得に失敗しました</p>;
  }
  const trainings = getTrainingsResult.value;

  type IsTrainingInDay = (date: number) => (training: Training) => boolean;
  const isTrainingInDay: IsTrainingInDay = (date) => (training) => {
    const trainingDay = subMinutes(
      new Date(training.date).getTime(),
      props.timezoneOffset
    );

    return isSameDay(date, trainingDay);
  };
  const trainingsInDay =
    props.calendar.week === undefined
      ? trainings.filter(isTrainingInDay(getDateFromCalendar(props.calendar)))
      : [];

  const baseHref = `/trainees/${props.traineeId}/trainings/` as const;

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingCalendar.Week
        {...props}
        traineeId={props.traineeId}
        timezoneOffset={props.timezoneOffset}
        trainings={trainings}
      />
      {props.calendar.week === undefined ? (
        <>
          <p>
            {props.calendar.year}年{props.calendar.month + 1}月
            {props.calendar.day}日のトレーニング
          </p>
          <ul>
            {trainingsInDay.map((training) => {
              return (
                <Link href={`${baseHref}/${training.id}`} key={training.id}>
                  <li>
                    <TrainingDetail training={training} />
                  </li>
                </Link>
              );
            })}
          </ul>
          <Link
            href={`/trainees/${
              props.traineeId
            }/trainings/register?training_date=${getDateFromCalendar(
              props.calendar
            )}`}
          >
            トレーニングを登録する
          </Link>
        </>
      ) : (
        <>
          <p>この週のトレーニング</p>
          <ul>
            {trainings.map((training) => {
              return (
                <Link href={`${baseHref}/${training.id}`} key={training.id}>
                  <li>
                    <TrainingDetail training={training} />
                  </li>
                </Link>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};
