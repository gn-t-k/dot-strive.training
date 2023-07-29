"use client";

import { addDays, subDays } from "date-fns";
import Link from "next/link";

import { EmojiIcon } from "@/app/_components/emoji-icon";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import { useCalendar } from "../../_hooks/use-calendar";

import type { Training } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: string;
  selected: UTCDateString;
  trainings: Training[];
};
export const WeeklyTrainingCalendarClient: FC<Props> = (props) => {
  const [{ week }] = useCalendar({
    today: utcDateStringSchema.parse(new Date().toISOString()),
    selected: props.selected,
  });
  const prevDate = subDays(new Date(props.selected), 7);
  const nextDate = addDays(new Date(props.selected), 7);

  return (
    <div role="row" className={grid({ columns: 9, alignItems: "center" })}>
      <Link
        href={`/trainees/${
          props.traineeId
        }/trainings/dates/${prevDate.getFullYear()}/${
          prevDate.getMonth() + 1
        }/${prevDate.getDate()}`}
      >
        <EmojiIcon emoji="◀" label="前週" size="small" />
      </Link>
      {week.map((day) => {
        const trainingsOnDay = props.trainings.filter((training) => {
          const date = new Date(training.date);

          return (
            date.getFullYear() === day.year &&
            date.getMonth() + 1 === day.month &&
            date.getDate() === day.date
          );
        });
        const isTrainingDay = trainingsOnDay.length > 0;
        const dateStyle = css({
          color: day.isSelectedDate
            ? "white"
            : day.isToday
            ? "green"
            : !day.isSelectedMonth
            ? "gray.300"
            : "black",
          bgColor: !day.isSelectedDate
            ? "white"
            : day.isToday
            ? "green"
            : "black",
          borderRadius: "50%",
          fontWeight: day.isSelectedDate ? "bold" : "normal",
          textAlign: "center",
          w: 8,
          h: 8,
        });

        return (
          <div role="cell" key={day.date}>
            <Link
              href={`/trainees/${props.traineeId}/trainings/dates/${day.year}/${day.month}/${day.date}`}
            >
              <div
                className={stack({
                  direction: "column",
                  alignItems: "center",
                  gap: 0,
                  textAlign: "center",
                })}
              >
                <span className={dateStyle}>{day.date}</span>
                <div
                  className={css({
                    display: "flex",
                    justifyContent: "center",
                  })}
                >
                  <EmojiIcon
                    label={
                      isTrainingDay ? "トレーニングあり" : "トレーニングなし"
                    }
                    emoji={isTrainingDay ? "🟩" : "⬜"}
                    size="small"
                  />
                </div>
              </div>
            </Link>
          </div>
        );
      })}
      <Link
        href={`/trainees/${
          props.traineeId
        }/trainings/dates/${nextDate.getFullYear()}/${
          nextDate.getMonth() + 1
        }/${nextDate.getDate()}`}
      >
        <EmojiIcon emoji="▶" label="次週" size="small" />
      </Link>
    </div>
  );
};
