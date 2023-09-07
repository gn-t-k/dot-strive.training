import {
  addDays,
  addWeeks,
  getDate,
  getMonth,
  getWeek,
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
  some,
  type None,
  type Option,
  type Some,
  none,
} from "../_utils/option";

import type { Training } from "../_schemas/training";
import type { Route } from "next";
import type { SystemStyleObject } from "styled-system/types";

type Input =
  | {
      view: "year";
      fullDate: true;
      year: number;
      month: Some<number>;
      day: Some<number>;
    }
  | {
      view: "year";
      fullDate: false;
      year: number;
      month: None;
      day: None;
    }
  | {
      view: "month";
      fullDate: true;
      year: number;
      month: Some<number>;
      day: Some<number>;
    }
  | {
      view: "month";
      fullDate: false;
      year: number;
      month: Some<number>;
      day: None;
    }
  | {
      view: "week";
      year: number;
      fullDate: true;
      month: Some<number>;
      day: Some<number>;
      week: None;
    }
  | {
      view: "week";
      year: number;
      fullDate: false;
      month: None;
      day: None;
      week: Some<number>;
    };

type DayProps = {
  date: number;
  input: Input;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Day: FC<DayProps> = (props) => {
  const isToday = isSameDay(props.date, new Date().getTime());

  const isOutOfMonth = ((): boolean => {
    switch (props.input.view) {
      case "year":
        return false;
      case "month":
        return !isSameMonth(
          props.date,
          new Date(props.input.year, props.input.month.value)
        );
      case "week": {
        const dateInMonth = props.input.fullDate
          ? new Date(
              props.input.year,
              props.input.month.value,
              props.input.day.value
            )
          : new Date(props.input.year, 0, 1 + (props.input.week.value - 1) * 7);
        return !isSameMonth(props.date, dateInMonth);
      }
    }
  })();

  const trainings = props.trainings.filter((training) => {
    const date = subMinutes(
      new Date(training.date),
      props.timezoneOffset
    ).getTime();

    return isSameDay(date, props.date);
  });
  const isTrainingDay = trainings.length > 0;

  const year = getYear(props.date);
  const month = getMonth(props.date);
  const day = getDate(props.date);
  const isSelected =
    props.input.month.hasSome &&
    props.input.day.hasSome &&
    props.input.year === year &&
    props.input.month.value === month &&
    props.input.day.value === day;

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

  const fullDateYearViewHref =
    `/trainees/${props.traineeId}/trainings/?year=${year}&month=${month}&day=${day}&view=year` as const;
  const fullDateMonthViewHref =
    `/trainees/${props.traineeId}/trainings/?year=${year}&month=${month}&day=${day}&view=month` as const;
  const fullDateWeekViewHref =
    `/trainees/${props.traineeId}/trainings/?year=${year}&month=${month}&day=${day}&view=week` as const;
  const yearHref =
    `/trainees/${props.traineeId}/trainings/?year=${year}&view=year` as const;
  const monthHref =
    `/trainees/${props.traineeId}/trainings/?year=${year}&month=${month}&view=month` as const;
  const weekHref = `/trainees/${
    props.traineeId
  }/trainings/?year=${year}&week=${getWeek(
    new Date(props.date)
  )}&view=week` as const;
  const href = ((): Route<
    | typeof fullDateYearViewHref
    | typeof fullDateMonthViewHref
    | typeof fullDateWeekViewHref
    | typeof yearHref
    | typeof monthHref
    | typeof weekHref
  > => {
    switch (props.input.view) {
      case "year":
        return props.input.fullDate &&
          isSameDay(
            props.date,
            new Date(
              props.input.year,
              props.input.month.value,
              props.input.day.value
            )
          )
          ? yearHref
          : fullDateYearViewHref;
      case "month":
        return props.input.fullDate &&
          isSameDay(
            props.date,
            new Date(
              props.input.year,
              props.input.month.value,
              props.input.day.value
            )
          )
          ? monthHref
          : fullDateMonthViewHref;
      case "week":
        return props.input.fullDate &&
          isSameDay(
            props.date,
            new Date(
              props.input.year,
              props.input.month.value,
              props.input.day.value
            )
          )
          ? weekHref
          : fullDateWeekViewHref;
    }
  })();

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
  year: number;
  month: number;
  day: Option<number>;
  traineeId: string;
  timezoneOffset: number;
  trainings: Training[];
};
export const Month: FC<MonthProps> = (props) => {
  const month = [0, 1, 2, 3, 4, 5].map((weekIndex) => {
    const topLeftDate = startOfWeek(new Date(props.year, props.month));
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
                    input={
                      props.day.hasSome
                        ? {
                            view: "month",
                            fullDate: true,
                            year: props.year,
                            month: some(props.month),
                            day: props.day,
                          }
                        : {
                            view: "month",
                            fullDate: false,
                            year: props.year,
                            month: some(props.month),
                            day: none(),
                          }
                    }
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
} & (
  | {
      fullDate: true;
      year: number;
      month: Some<number>;
      day: Some<number>;
      week: None;
    }
  | {
      fullDate: false;
      year: number;
      month: None;
      day: None;
      week: Some<number>;
    }
);
export const Week: FC<WeekProps> = (props) => {
  const sunday = props.fullDate
    ? new Date(props.year, props.month.value, props.day.value)
    : new Date(props.year, 0, 1 + (props.week.value - 1) * 7);
  const startOfSunday = startOfWeek(sunday);
  const week = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
    const date = addDays(startOfSunday, dayIndex).getTime();

    return date;
  });

  return (
    <div role="row" className={grid({ columns: 7, alignItems: "center" })}>
      {week.map((date) => {
        return (
          <Day
            date={date}
            input={
              props.fullDate
                ? {
                    view: "week",
                    fullDate: true,
                    year: props.year,
                    month: props.month,
                    day: props.day,
                    week: none(),
                  }
                : {
                    view: "week",
                    fullDate: false,
                    year: props.year,
                    month: none(),
                    day: none(),
                    week: props.week,
                  }
            }
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
