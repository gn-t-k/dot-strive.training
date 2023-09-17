import Link from "next/link";

import * as ToggleGroup from "@/app/_components/toggle-group";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import {
  changeViewToMonth,
  changeViewToWeek,
  changeViewToYear,
  getSearchParams,
} from "../_schemas/calendar";

import type { Calendar } from "../_schemas/calendar";
import type { FC, PropsWithChildren } from "react";

type Props = {
  traineeId: string;
  calendar: Calendar;
};
export const TrainingCalendarViewSwitcher: FC<Props> = (props) => {
  const baseHref = `/trainees/${props.traineeId}/trainings/` as const;

  const weekViewHref = `${baseHref}?${getSearchParams(
    changeViewToWeek(props.calendar)
  ).toString()}` as const;
  const monthViewHref = `${baseHref}?${getSearchParams(
    changeViewToMonth(props.calendar)
  ).toString()}` as const;
  const yearViewHref = `${baseHref}?${getSearchParams(
    changeViewToYear(props.calendar)
  ).toString()}` as const;

  return (
    <ToggleGroup.Root
      type="single"
      value={props.calendar.view}
      className={stack({
        direction: "row",
        w: "full",
        justify: "center",
        align: "center",
        bg: "gray.100",
        borderRadius: "4px",
        p: "4px",
      })}
    >
      <div className={css({ w: "full" })}>
        <Link href={weekViewHref} passHref>
          <ToggleGroup.Item value="week" className={css({ w: "full" })}>
            <Label selected={props.calendar.view === "week"}>週</Label>
          </ToggleGroup.Item>
        </Link>
      </div>

      <div className={css({ w: "full" })}>
        <Link href={monthViewHref} passHref>
          <ToggleGroup.Item value="month" className={css({ w: "full" })}>
            <Label selected={props.calendar.view === "month"}>月</Label>
          </ToggleGroup.Item>
        </Link>
      </div>
      <div className={css({ w: "full" })}>
        <Link href={yearViewHref} passHref>
          <ToggleGroup.Item value="year" className={css({ w: "full" })}>
            <Label selected={props.calendar.view === "year"}>年</Label>
          </ToggleGroup.Item>
        </Link>
      </div>
      <ToggleGroup.Item value="week"></ToggleGroup.Item>
    </ToggleGroup.Root>
  );
};

type LabelProps = {
  selected: boolean;
};
const Label: FC<PropsWithChildren<LabelProps>> = (props) => {
  return (
    <div
      className={css({
        borderRadius: "4px",
        bg: props.selected ? "white" : "transparent",
      })}
    >
      {props.children}
    </div>
  );
};
