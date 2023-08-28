import {
  addDays,
  addMinutes,
  addWeeks,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { css } from "styled-system/css";

import type { Training } from "../_schemas/training";
import type { FC } from "react";

type DayProps = {
  date: CalendarDate;
  trainings: Training[];
  timezoneOffset: number;
};
export const Day: FC<DayProps> = (props) => {
  const isTrainingDay = props.trainings.some((training) => {
    const date = addMinutes(new Date(training.date), props.timezoneOffset);

    return (
      date.getFullYear() === props.date.year &&
      date.getMonth() + 1 === props.date.month &&
      date.getDate() === props.date.day
    );
  });
  const style = css({
    bgColor: isTrainingDay ? "green" : "transparent",
    border: props.date.isToday ? "3px solid green" : "none",
    borderRadius: "50%",
  });

  return (
    <div role="cell" className={style}>
      {props.date.day}
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
  today: Date;
  selected: Date;
  timezoneOffset: number;
}) => Month;
const getMonthlyCalendar: GetMonthlyCalendar = (props) => {
  const topLeftDate = addMinutes(
    startOfWeek(startOfMonth(props.selected)),
    props.timezoneOffset
  );

  return [0, 1, 2, 3, 4, 5].map((weekIndex) => {
    const startSunday = addWeeks(topLeftDate, weekIndex);

    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const date = addDays(startSunday, dayIndex);

      return getCalendarDate({
        date,
        today: props.today,
        selected: props.selected,
      });
    });
  });
};

type GetWeeklyCalendar = (props: {
  today: Date;
  selected: Date;
  timezoneOffset: number;
}) => Week;
const getWeeklyCalendar: GetWeeklyCalendar = (props) => {
  const startSunday = addMinutes(
    startOfWeek(props.selected),
    props.timezoneOffset
  );

  return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
    const date = addDays(startSunday, dayIndex);

    return getCalendarDate({
      date,
      today: props.today,
      selected: props.selected,
    });
  });
};

type GetCalendarDate = (props: {
  date: Date;
  today: Date;
  selected: Date;
}) => CalendarDate;
export const getCalendarDate: GetCalendarDate = (props) => {
  const year = props.date.getFullYear();
  const month = props.date.getMonth() + 1;
  const day = props.date.getDate();
  const isToday =
    year === props.today.getFullYear() &&
    month === props.today.getMonth() + 1 &&
    day === props.today.getDate();
  const isSelectedYear = year === props.selected.getFullYear();
  const isSelectedMonth =
    isSelectedYear && month === props.selected.getMonth() + 1;
  const isSelectedDay = isSelectedMonth && day === props.selected.getDate();

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
