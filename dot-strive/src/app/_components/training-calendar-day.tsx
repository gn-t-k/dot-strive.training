"use client";

import Link from "next/link";

import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { EmojiIcon } from "./emoji-icon";

import type { CalendarDate } from "../_hooks/use-calendar";
import type { Training } from "../_schemas/training";
import type { FC } from "react";

type Props = {
  traineeId: string;
  trainings: Training[];
  day: CalendarDate;
};
export const TrainingCalendarDay: FC<Props> = (props) => {
  const trainingsOnDay = props.trainings.filter((training) => {
    const date = new Date(training.date);

    return (
      date.getFullYear() === props.day.year &&
      date.getMonth() + 1 === props.day.month &&
      date.getDate() === props.day.date
    );
  });
  const isTrainingDay = trainingsOnDay.length > 0;
  const dateStyle = css({
    color: props.day.isSelectedDate
      ? "white"
      : props.day.isToday
      ? "green"
      : !props.day.isSelectedMonth
      ? "gray.300"
      : "black",
    bgColor: !props.day.isSelectedDate
      ? "white"
      : props.day.isToday
      ? "green"
      : "black",
    borderRadius: "50%",
    fontWeight: props.day.isSelectedDate ? "bold" : "normal",
    textAlign: "center",
    w: 8,
    h: 8,
  });

  return (
    <div role="cell" key={props.day.date}>
      <Link
        href={`/trainees/${props.traineeId}/trainings/dates/${props.day.year}/${props.day.month}/${props.day.date}`}
      >
        <div
          className={stack({
            direction: "column",
            alignItems: "center",
            gap: 0,
            textAlign: "center",
          })}
        >
          <span className={dateStyle}>{props.day.date}</span>
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
            })}
          >
            <EmojiIcon
              label={isTrainingDay ? "トレーニングあり" : "トレーニングなし"}
              emoji={isTrainingDay ? "🟩" : "⬜"}
              size="small"
            />
          </div>
        </div>
      </Link>
    </div>
  );
};
