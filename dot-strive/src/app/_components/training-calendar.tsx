import {
  addDays,
  addMinutes,
  addWeeks,
  format,
  getDate,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import Link from "next/link";

import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import { TrainingPopover } from "./trainings-popover";

import type { Training } from "../_schemas/training";
import type { FC } from "react";

type MonthProps = {
  selectedDate: number;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Month: FC<MonthProps> = (props) => {
  const topLeftDate = startOfWeek(startOfMonth(props.selectedDate)).getTime();

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
                    selectedDate={props.selectedDate}
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
            selectedDate={props.selectedDate}
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

type DayProps = {
  date: number;
  selectedDate: number;
  trainings: Training[];
  traineeId: string;
  timezoneOffset: number;
};
export const Day: FC<DayProps> = (props) => {
  const today = new Date().getTime();
  const isToday = isSameDay(props.date, today);
  const isSelectedMonth = isSameMonth(props.date, props.selectedDate);
  const trainings = props.trainings.filter((training) => {
    const date = new Date(training.date).getTime();

    return isSameDay(date, addMinutes(props.date, props.timezoneOffset));
  });
  const isTrainingDay = trainings.length > 0;
  const style = css({
    color: isSelectedMonth ? "black" : "gray.300",
    bgColor: isTrainingDay ? "Highlight" : "transparent",
    outline: isToday ? "3px solid" : "none",
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
        {getDate(props.date)}
      </div>
    </TrainingPopover>
  ) : (
    <div role="cell" className={style}>
      <Link
        href={`/trainees/${props.traineeId}/trainings/register?date=${format(
          props.date,
          "yyyy-MM-dd"
        )}')}`}
        className={css({ textAlign: "center" })}
      >
        {getDate(props.date)}
      </Link>
    </div>
  );
};
