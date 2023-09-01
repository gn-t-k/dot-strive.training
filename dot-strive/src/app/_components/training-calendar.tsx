import {
  addDays,
  addWeeks,
  getDate,
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

import { EmojiIcon } from "./emoji-icon";
import { TrainingPopover } from "./trainings-popover";
import { some, type None, type Option, type Some } from "../_utils/option";

import type { Training } from "../_schemas/training";
import type { FC } from "react";
import type { SystemStyleObject } from "styled-system/types";

type Input =
  | {
      view: "year";
      year: number;
      month: Some<number>;
      day: Some<number>;
    }
  | {
      view: "year";
      year: number;
      month: None;
      day: None;
    }
  | {
      view: "month";
      year: number;
      month: Some<number>;
      day: Option<number>;
    }
  | {
      view: "week";
      year: number;
      month: Some<number>;
      day: Some<number>;
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

  const isOutOfMonth =
    props.input.view === "month" &&
    !isSameMonth(
      props.date,
      new Date(props.input.year, props.input.month.value)
    );

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

  return trainings.length > 0 ? (
    <TrainingPopover traineeId={props.traineeId} trainings={trainings}>
      <div
        role="cell"
        className={stack({
          direction: "column",
          gap: 0,
          height: "80px",
          align: "center",
        })}
      >
        <div className={dayStyle}>{getDate(props.date)}</div>
        <EmojiIcon
          emoji="🏋️"
          label={`${year}/${month + 1}/${day}のトレーニングを${
            isTrainingDay ? "確認" : "登録"
          }`}
          size="small"
        />
      </div>
    </TrainingPopover>
  ) : (
    <div
      role="cell"
      className={stack({
        direction: "column",
        gap: 0,
        height: "80px",
        align: "center",
      })}
    >
      <Link
        href={`/trainees/${props.traineeId}/trainings/dates/${year}/${
          month + 1
        }/${day}`}
        className={css({ textAlign: "center" })}
      >
        <div className={dayStyle}>{getDate(props.date)}</div>
      </Link>
    </div>
  );
};

type MonthProps = {
  year: number;
  month: number;
  day: Option<number>;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Month: FC<MonthProps> = (props) => {
  const topLeftDate = startOfWeek(
    startOfMonth(new Date(props.year, props.month))
  ).getTime();

  const month = [0, 1, 2, 3, 4, 5].map((weekIndex) => {
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
                    input={{
                      view: "month",
                      year: props.year,
                      month: some(props.month),
                      day: props.day,
                    }}
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
  selectedDate: number;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Week: FC<WeekProps> = (props) => {
  const startSunday = startOfWeek(props.selectedDate).getTime();

  const week = [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
    const date = addDays(startSunday, dayIndex).getTime();

    return date;
  });

  return (
    <div role="row" className={grid({ columns: 7, alignItems: "center" })}>
      {week.map((date) => {
        return (
          <Day
            date={date}
            input={props.selectedDate}
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
