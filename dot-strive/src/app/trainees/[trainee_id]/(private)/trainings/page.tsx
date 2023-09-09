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
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { getTimezoneOffset } from "@/app/_actions/get-timezone-offset";
import { getTrainingsByDateRange } from "@/app/_actions/get-trainings-by-date-range";
import * as TrainingCalendar from "@/app/_components/training-calendar";
import { TrainingCalendarToggleGroup } from "@/app/_components/training-calendar-toggle-group";
import { TrainingDetailView } from "@/app/_components/training-detail";
import {
  calendarSchema,
  changeViewToMonth,
  changeViewToWeek,
  getDateFromCalendar,
  getDateFromWeek,
} from "@/app/_schemas/calendar";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import type { Calendar } from "@/app/_schemas/calendar";
import type { Training } from "@/app/_schemas/training";
import type { NextPage } from "@/app/_types/page";
import type { Route } from "next";
import type { FC } from "react";

const Page: NextPage = (props) => {
  const traineeId = props.params?.["trainee_id"];
  if (!traineeId) {
    redirect("/" satisfies Route);
  }

  const monthParam = props.searchParams?.month;
  const dayParam = props.searchParams?.day;
  const weekParam = props.searchParams?.week;

  const today = new Date();

  const timezoneOffset = getTimezoneOffset();

  const defaultView = "month" satisfies Calendar["view"];
  const defaultYear = getYear(today);
  const defaultMonth = getMonth(today);
  const defaultDay = getDate(today);

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
      ["day", String(defaultDay)],
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

      return (
        <div className={stack({ direction: "column" })}>
          <div
            className={css({
              w: "full",
              px: "16px",
              justifyContent: "center",
            })}
          >
            <TrainingCalendarToggleGroup
              traineeId={traineeId}
              calendar={monthCalendar}
            />
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

      return (
        <div className={stack({ direction: "column" })}>
          <div
            className={css({
              w: "full",
              px: "16px",
              justifyContent: "center",
            })}
          >
            <TrainingCalendarToggleGroup
              traineeId={traineeId}
              calendar={weekCalendar}
            />
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
  const firstDayOfMonth = new Date(props.calendar.year, props.calendar.month);
  const topLeftDate = addMinutes(
    startOfWeek(firstDayOfMonth),
    props.timezoneOffset
  );
  const bottomRightDate = addMinutes(
    endOfWeek(endOfMonth(firstDayOfMonth)),
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
    isTrainingInMonth(new Date(props.calendar.year, props.calendar.month))
  );

  type IsTrainingInDay = (date: Date) => (training: Training) => boolean;
  const isTrainingInDay: IsTrainingInDay = (date) => (training) => {
    const trainingDay = subMinutes(
      new Date(training.date),
      props.timezoneOffset
    );

    return isSameDay(date, trainingDay);
  };
  const trainingsInDay =
    props.calendar.day !== undefined
      ? trainings.filter(isTrainingInDay(getDateFromCalendar(props.calendar)))
      : [];

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingCalendar.Month
        traineeId={props.traineeId}
        timezoneOffset={props.timezoneOffset}
        trainings={trainings}
        calendar={props.calendar}
      />
      <p>
        {props.calendar.day !== undefined
          ? `${props.calendar.year}年${props.calendar.month + 1}月${
              props.calendar.day
            }日のトレーニング`
          : `${props.calendar.year}年${
              props.calendar.month + 1
            }月のトレーニング`}
      </p>
      <ul>
        {(props.calendar.day ? trainingsInDay : trainingsInMonth).map(
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
    addMinutes(startOfWeek(sunday), props.timezoneOffset),
    addMinutes(endOfWeek(sunday), props.timezoneOffset),
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

  type IsTrainingInDay = (date: Date) => (training: Training) => boolean;
  const isTrainingInDay: IsTrainingInDay = (date) => (training) => {
    const trainingDay = subMinutes(
      new Date(training.date),
      props.timezoneOffset
    );

    return isSameDay(date, trainingDay);
  };
  const trainingsInDay =
    props.calendar.week === undefined
      ? trainings.filter(isTrainingInDay(getDateFromCalendar(props.calendar)))
      : [];

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingCalendar.Week
        {...props}
        traineeId={props.traineeId}
        timezoneOffset={props.timezoneOffset}
        trainings={trainings}
      />
      <p>
        {props.calendar.week === undefined
          ? `${props.calendar.year}年${props.calendar.month + 1}月${
              props.calendar.day
            }日のトレーニング`
          : `この週のトレーニング`}
      </p>
      <ul>
        {(props.calendar.week === undefined ? trainingsInDay : trainings).map(
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
