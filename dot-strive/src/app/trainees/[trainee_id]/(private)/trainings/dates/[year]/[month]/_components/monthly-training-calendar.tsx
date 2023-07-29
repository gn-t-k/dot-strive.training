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
export const MonthlyTrainingCalendar: FC<Props> = (props) => {
  const [{ month }] = useCalendar({
    today: utcDateStringSchema.parse(new Date().toISOString()),
    selected: props.selected,
  });

  return (
    <div role="table" className={css({ p: 4 })}>
      <div role="rowgroup" className={stack({ direction: "column", gap: 4 })}>
        {month.map((week, index) => {
          return (
            <div
              role="row"
              className={grid({ columns: 7 })}
              key={`week-${index}`}
            >
              {week.map((day) => {
                const trainings = props.trainings.filter((training) => {
                  const date = new Date(training.date);

                  return (
                    date.getFullYear() === day.year &&
                    date.getMonth() + 1 === day.month &&
                    date.getDate() === day.date
                  );
                });
                const isTrainingDay = trainings.length > 0;

                return (
                  <div role="cell" key={day.date}>
                    <Link
                      href={`/trainees/${props.traineeId}/trainings/dates/${day.year}/${day.month}/${day.date}`}
                    >
                      <div
                        className={stack({
                          direction: "column",
                          justify: "center",
                          gap: 0,
                          textAlign: "center",
                        })}
                      >
                        <span
                          className={css({
                            color: day.isSelectedMonth ? "black" : "gray.300",
                            fontWeight: day.isToday ? "bold" : "normal",
                          })}
                        >
                          {day.date}
                        </span>
                        <div
                          className={css({
                            display: "flex",
                            justifyContent: "center",
                          })}
                        >
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
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
