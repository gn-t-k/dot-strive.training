"use client";

import { TrainingCalendarDay } from "@/app/_components/training-calendar-day";
import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { css } from "styled-system/css";
import { grid, stack } from "styled-system/patterns";

import { useCalendar } from "./use-calendar";

import type { Training } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: string;
  trainings: Training[];
  selected: UTCDateString;
};
export const TrainingCalendarMonth: FC<Props> = (props) => {
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
                return (
                  <TrainingCalendarDay
                    traineeId={props.traineeId}
                    trainings={props.trainings}
                    day={{
                      ...day,
                      isSelectedDate: false,
                    }}
                    key={day.date}
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
