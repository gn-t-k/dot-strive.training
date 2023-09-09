import {
  addDays,
  addWeeks,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subMinutes,
} from "date-fns";
import Link from "next/link";
import { type FC } from "react";

import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import { EmojiIcon } from "./emoji-icon";
import {
  deselectDate,
  getDateFromCalendar,
  getDateFromWeek,
  selectDate,
} from "../_schemas/calendar";

import type { Calendar } from "../_schemas/calendar";
import type { Training } from "../_schemas/training";
import type { SystemStyleObject } from "styled-system/types";

type DayProps = {
  date: number;
  calendar: Calendar;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Day: FC<DayProps> = (props) => {
  const isToday = isSameDay(props.date, new Date().getTime());

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
    width: "40px",
    height: "40px",
    lineHeight: "40px",
    textAlign: "center",
  } as const;
  const dayStyle = isToday
    ? css({
        ...commonStyle,
        color: "white",
        bgColor: "blue",
      })
    : !isSelected && isOutOfMonth
    ? css({
        ...commonStyle,
        color: "gray.300",
      })
    : isSelected && !isOutOfMonth
    ? css({
        ...commonStyle,
        bgColor: "blue.300",
      })
    : css(commonStyle);

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
        <div
          className={stack({
            direction: "column",
            gap: 0,
            height: "80px",
            align: "center",
          })}
        >
          <div className={dayStyle}>{getDate(props.date)}</div>
          {trainings.length > 0 && (
            <EmojiIcon
              emoji="🏋️"
              label={`${year}/${month + 1}/${day}のトレーニングを${
                isTrainingDay ? "確認" : "登録"
              }`}
              size="small"
            />
          )}
        </div>
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
  const month = [0, 1, 2, 3, 4, 5].map((weekIndex) => {
    const topLeftDate = startOfWeek(
      new Date(props.calendar.year, props.calendar.month).getTime()
    ).getTime();
    const startSunday = addWeeks(topLeftDate, weekIndex).getTime();

    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const date = addDays(startSunday, dayIndex).getTime();

      return date;
    });
  });

  return (
    <div role="table">
      <div role="rowgroup" className={stack({ direction: "column", gap: 4 })}>
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
  const week = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
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
