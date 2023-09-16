import {
  addDays,
  addWeeks,
  getDate,
  getDay,
  getDaysInMonth,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMinutes,
} from "date-fns";
import Link from "next/link";

import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import {
  deselectDate,
  getDateFromCalendar,
  getDateFromWeek,
  selectDate,
} from "../_schemas/calendar";

import type { Calendar } from "../_schemas/calendar";
import type { Training } from "../_schemas/training";
import type { FC } from "react";
import type { SystemStyleObject } from "styled-system/types";

type DayProps = {
  date: number;
  calendar: Calendar;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Day: FC<DayProps> = (props) => {
  const isToday = isSameDay(
    props.date,
    subMinutes(new Date(), props.timezoneOffset).getTime()
  );

  const isOutOfMonth = ((): boolean => {
    switch (props.calendar.view) {
      case "year":
        return false;
      case "month":
        return !isSameMonth(
          props.date,
          new Date(props.calendar.year, props.calendar.month).getTime()
        );
      case "week": {
        const dateInMonth =
          props.calendar.week !== undefined
            ? getDateFromWeek(props.calendar)
            : getDateFromCalendar(props.calendar);
        return !isSameMonth(props.date, dateInMonth);
      }
    }
  })();

  const trainings = props.trainings.filter((training) => {
    const date = subMinutes(
      new Date(training.date).getTime(),
      props.timezoneOffset
    ).getTime();

    return isSameDay(date, props.date);
  });
  const isTrainingDay = trainings.length > 0;

  const year = getYear(props.date);
  const month = getMonth(props.date);
  const day = getDate(props.date);
  const isSelected =
    props.calendar.month !== undefined &&
    props.calendar.day !== undefined &&
    isSameDay(props.date, getDateFromCalendar(props.calendar));

  const commonStyle: SystemStyleObject = {
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    lineHeight: "32px",
    textAlign: "center",
  } as const;
  const dayStyle =
    props.calendar.day === undefined || isSelected
      ? // 特定の日付が選択されていない もしくは この日が選択されているパターン
        !isToday && !isTrainingDay && !isOutOfMonth
        ? css(commonStyle)
        : !isToday && !isTrainingDay && isOutOfMonth
        ? css({ ...commonStyle, color: "gray.300" })
        : !isToday && isTrainingDay && !isOutOfMonth
        ? css({ ...commonStyle, bgColor: "green.300" })
        : !isToday && isTrainingDay && isOutOfMonth
        ? css({ ...commonStyle, bgColor: "green.300" })
        : isToday && !isTrainingDay && !isOutOfMonth
        ? css({ ...commonStyle, fontWeight: "extrabold" })
        : isToday && !isTrainingDay && isOutOfMonth
        ? css({ ...commonStyle, color: "gray.300", fontWeight: "extrabold" })
        : isToday && isTrainingDay && !isOutOfMonth
        ? css({ ...commonStyle, bgColor: "green.300", fontWeight: "extrabold" })
        : // isToday && isTrainingDay && isOutOfMonth ?
          css({
            ...commonStyle,
            bgColor: "green.300",
            fontWeight: "extrabold",
          })
      : // この日以外の日付が選択されているパターン
      !isToday && !isTrainingDay && !isOutOfMonth
      ? css({ ...commonStyle, color: "gray.300" })
      : !isToday && !isTrainingDay && isOutOfMonth
      ? css({ ...commonStyle, color: "gray.300" })
      : !isToday && isTrainingDay && !isOutOfMonth
      ? css({ ...commonStyle, color: "gray.300", bgColor: "green.100" })
      : !isToday && isTrainingDay && isOutOfMonth
      ? css({ ...commonStyle, color: "gray.300", bgColor: "green.100" })
      : isToday && !isTrainingDay && !isOutOfMonth
      ? css({ ...commonStyle, color: "gray.300", fontWeight: "extrabold" })
      : isToday && !isTrainingDay && isOutOfMonth
      ? css({ ...commonStyle, color: "gray.300", fontWeight: "extrabold" })
      : isToday && isTrainingDay && !isOutOfMonth
      ? css({
          ...commonStyle,
          color: "gray.300",
          bgColor: "green.100",
          fontWeight: "extrabold",
        })
      : // isToday && isTrainingDay && isOutOfMonth ?
        css({
          ...commonStyle,
          color: "gray.300",
          bgColor: "green.100",
          fontWeight: "extrabold",
        });

  const clickedCalendar =
    props.calendar.day !== undefined &&
    isSameDay(props.date, getDateFromCalendar(props.calendar))
      ? deselectDate(props.calendar)
      : selectDate(props.calendar)({ year, month, day });

  const searchParams = new URLSearchParams([
    ["year", String(year)],
    ["view", props.calendar.view],
  ]);
  if (clickedCalendar.month !== undefined) {
    searchParams.append("month", String(clickedCalendar.month));
  }
  if (clickedCalendar.day !== undefined) {
    searchParams.append("day", String(clickedCalendar.day));
  }
  if (clickedCalendar.week !== undefined) {
    searchParams.append("week", String(clickedCalendar.week));
  }
  const href = `/trainees/${
    props.traineeId
  }/trainings/?${searchParams.toString()}` as const;

  return (
    <div role="cell">
      <Link href={href}>
        <div className={dayStyle}>{getDate(props.date)}</div>
      </Link>
    </div>
  );
};

type MonthProps = {
  traineeId: string;
  timezoneOffset: number;
  trainings: Training[];
  calendar: Extract<Calendar, { view: "month" }>;
};
export const Month: FC<MonthProps> = (props) => {
  const firstDate = new Date(
    props.calendar.year,
    props.calendar.month
  ).getTime();
  const month =
    // その月のカレンダーの行数を計算し、その行数分の配列を作成する
    Array.from({
      length: Math.ceil(
        (getDay(startOfMonth(firstDate)) + getDaysInMonth(firstDate)) / 7
      ),
    }).map((_, weekIndex) => {
      const topLeftDate = startOfWeek(firstDate).getTime();
      const startSunday = addWeeks(topLeftDate, weekIndex).getTime();

      return Array.from({ length: 7 }).map((_, dayIndex) => {
        const date = addDays(startSunday, dayIndex).getTime();

        return date;
      });
    });

  return (
    <div role="table">
      <div role="rowgroup" className={stack({ direction: "column", gap: 2 })}>
        {month.map((week, index) => {
          return (
            <div
              role="row"
              className={grid({
                columns: 7,
                placeItems: "center",
              })}
              key={`week-${index}`}
            >
              {week.map((date) => {
                return (
                  <Day
                    date={date}
                    calendar={props.calendar}
                    trainings={props.trainings}
                    traineeId={props.traineeId}
                    timezoneOffset={props.timezoneOffset}
                    key={date}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type WeekProps = {
  traineeId: string;
  timezoneOffset: number;
  trainings: Training[];
  calendar: Extract<Calendar, { view: "week" }>;
};
export const Week: FC<WeekProps> = (props) => {
  const sunday = startOfWeek(
    props.calendar.week !== undefined
      ? getDateFromWeek(props.calendar)
      : getDateFromCalendar(props.calendar)
  ).getTime();
  const week = Array.from({ length: 7 }).map((_, dayIndex) => {
    const date = addDays(sunday, dayIndex).getTime();

    return date;
  });

  return (
    <div role="row" className={grid({ columns: 7, alignItems: "center" })}>
      {week.map((date) => {
        return (
          <Day
            date={date}
            calendar={props.calendar}
            trainings={props.trainings}
            traineeId={props.traineeId}
            timezoneOffset={props.timezoneOffset}
            key={date}
          />
        );
      })}
    </div>
  );
};
