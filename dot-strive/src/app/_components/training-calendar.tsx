import {
  addDays,
  addMinutes,
  addWeeks,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import Link from "next/link";

import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import { TrainingPopover } from "./trainings-popover";
import { utcDateStringSchema } from "../_schemas/utc-date-string";

import type { Training } from "../_schemas/training";
import type { UTCDateString } from "../_schemas/utc-date-string";
import type { FC } from "react";

type MonthProps = {
  selected: UTCDateString;
  timezoneOffset: number;
  trainings: Training[];
  traineeId: string;
};
export const Month: FC<MonthProps> = (props) => {
  const today = utcDateStringSchema.parse(
    addMinutes(new Date(), props.timezoneOffset).toISOString()
  );
  const month = getMonthlyCalendar({
    today,
    selected: props.selected,
    timezoneOffset: props.timezoneOffset,
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
                    trainings={props.trainings}
                    timezoneOffset={props.timezoneOffset}
                    traineeId={props.traineeId}
                    key={date.day}
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
  today: UTCDateString;
  selected: UTCDateString;
  timezoneOffset: number;
  trainings: Training[];
  traineeId: string;
};
export const Week: FC<WeekProps> = (props) => {
  const week = getWeeklyCalendar({
    today: props.today,
    selected: props.selected,
    timezoneOffset: props.timezoneOffset,
  });

  return (
    <div role="row" className={grid({ columns: 7, alignItems: "center" })}>
      {week.map((date) => {
        return (
          <Day
            date={date}
            trainings={props.trainings}
            timezoneOffset={props.timezoneOffset}
            traineeId={props.traineeId}
            key={date.day}
          />
        );
      })}
    </div>
  );
};

type DayProps = {
  date: CalendarDate;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Day: FC<DayProps> = (props) => {
  const trainings = props.trainings.filter((training) => {
    const date = stringToDate(training.date, props.timezoneOffset);

    return (
      date.getFullYear() === props.date.year &&
      date.getMonth() + 1 === props.date.month &&
      date.getDate() === props.date.day
    );
  });
  const isTrainingDay = trainings.length > 0;
  const style = css({
    color: props.date.isSelectedMonth ? "black" : "gray.300",
    bgColor: isTrainingDay ? "Highlight" : "transparent",
    outline: props.date.isToday ? "3px solid" : "none",
    outlineOffset: "-3px",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    lineHeight: "40px",
    textAlign: "center",
  });

  return trainings.length > 0 ? (
    <TrainingPopover traineeId={props.traineeId} trainings={trainings}>
      <div role="cell" className={style}>
        {props.date.day}
      </div>
    </TrainingPopover>
  ) : (
    <div role="cell" className={style}>
      <Link
        href={`/trainees/${props.traineeId}/trainings/register?date=${props.date.year}-${props.date.month}-${props.date.day}`}
        className={css({ textAlign: "center" })}
      >
        {props.date.day}
      </Link>
    </div>
  );
};

type Month = Week[];
type Week = CalendarDate[];
type CalendarDate = {
  year: number;
  month: number;
  day: number;
  isToday: boolean;
  isSelectedYear: boolean;
  isSelectedMonth: boolean;
  isSelectedDay: boolean;
};

type GetMonthlyCalendar = (props: {
  today: UTCDateString;
  selected: UTCDateString;
  timezoneOffset: number;
}) => Month;
const getMonthlyCalendar: GetMonthlyCalendar = (props) => {
  const selected = stringToDate(props.selected, props.timezoneOffset);
  const topLeftDate = startOfWeek(startOfMonth(selected));

  return [0, 1, 2, 3, 4, 5].map((weekIndex) => {
    const startSunday = addWeeks(topLeftDate, weekIndex);

    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const date = dateToString(addDays(startSunday, dayIndex));

      return getCalendarDate({
        date,
        today: props.today,
        selected: props.selected,
        timezoneOffset: props.timezoneOffset,
      });
    });
  });
};

type GetWeeklyCalendar = (props: {
  today: UTCDateString;
  selected: UTCDateString;
  timezoneOffset: number;
}) => Week;
const getWeeklyCalendar: GetWeeklyCalendar = (props) => {
  const selected = stringToDate(props.selected, props.timezoneOffset);
  const startSunday = startOfWeek(selected);

  return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
    const date = dateToString(addDays(startSunday, dayIndex));

    return getCalendarDate({
      date,
      today: props.today,
      selected: props.selected,
      timezoneOffset: props.timezoneOffset,
    });
  });
};

type GetCalendarDate = (props: {
  date: UTCDateString;
  today: UTCDateString;
  selected: UTCDateString;
  timezoneOffset: number;
}) => CalendarDate;
export const getCalendarDate: GetCalendarDate = (props) => {
  const date = stringToDate(props.date, props.timezoneOffset);
  const today = stringToDate(props.today, props.timezoneOffset);
  const selected = stringToDate(props.selected, props.timezoneOffset);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate();

  const isSelectedYear = year === selected.getFullYear();
  const isSelectedMonth = isSelectedYear && month === selected.getMonth() + 1;
  const isSelectedDay = isSelectedMonth && day === selected.getDate();

  return {
    year,
    month,
    day,
    isToday,
    isSelectedYear,
    isSelectedMonth,
    isSelectedDay,
  };
};

type StringToDate = (date: UTCDateString, timezoneOffset: number) => Date;
const stringToDate: StringToDate = (date, timezoneOffset) => {
  return addMinutes(new Date(date), timezoneOffset);
};

type DateToString = (date: Date) => UTCDateString;
const dateToString: DateToString = (date) => {
  return utcDateStringSchema.parse(date.toISOString());
};
