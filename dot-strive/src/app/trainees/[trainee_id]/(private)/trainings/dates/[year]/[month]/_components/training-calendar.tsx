"use client";

import Link from "next/link";

import { EmojiIcon } from "@/app/_components/emoji-icon";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import { useCalendar } from "../_hooks/use-calendar";

import type { Training } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: string;
  trainings: Training[];
  selected: UTCDateString;
};
export const TrainingCalendar: FC<Props> = (props) => {
  const [{ calendar }, { select }] = useCalendar({
    today: utcDateStringSchema.parse(new Date().toISOString()),
    selected: props.selected,
  });

  return (
    <div role="table" className={css({ p: 4 })}>
      <div role="rowgroup" className={stack({ direction: "column", gap: 4 })}>
        {calendar.map((week, index) => {
          return (
            <div
              role="row"
              className={grid({ columns: 7 })}
              key={`week-${index}`}
            >
              {week.map((day) => {
                const isTrainingDay = props.trainings.some((training) => {
                  const date = new Date(training.date);

                  return (
                    date.getFullYear() === day.year &&
                    date.getMonth() + 1 === day.month &&
                    date.getDate() === day.date
                  );
                });
                return (
                  <Link
                    href={`/trainees/${props.traineeId}/trainings/dates/${day.year}/${day.month}/${day.date}`}
                    key={day.date}
                  >
                    <div
                      role="cell"
                      className={css({
                        display: "flex",
                        justifyContent: "center",
                      })}
                    >
                      <div className={stack({ direction: "column", gap: 0 })}>
                        <span className={css({ textAlign: "center" })}>
                          {day.date}
                        </span>
                        <EmojiIcon
                          label={
                            isTrainingDay
                              ? "トレーニングあり"
                              : "トレーニングなし"
                          }
                          emoji={isTrainingDay ? "🟩" : "⬜"}
                          size="small"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
