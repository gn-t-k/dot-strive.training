"use client";

import { addDays, subDays } from "date-fns";
import Link from "next/link";

import { grid } from "styled-system/patterns";

import { EmojiIcon } from "./emoji-icon";
import { TrainingCalendarDay } from "./training-calendar-day";
import { useCalendar } from "./use-calendar";
import { utcDateStringSchema } from "../_schemas/utc-date-string";

import type { Training } from "../_schemas/training";
import type { UTCDateString } from "../_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: string;
  selected: UTCDateString;
  trainings: Training[];
};
export const TrainingCalendarWeek: FC<Props> = (props) => {
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
        return (
          <TrainingCalendarDay
            traineeId={props.traineeId}
            trainings={props.trainings}
            day={day}
            key={day.date}
          />
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
