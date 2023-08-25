import { addDays, getDay, startOfMonth, subDays } from "date-fns";
import { useCallback, useMemo, useState } from "react";

import type { UTCDateString } from "@/app/_schemas/utc-date-string";

type UseCalendar = (props: {
  today: UTCDateString;
  selected: UTCDateString;
}) => [
  {
    month: Month;
    week: Week;
  },
  {
    select: Select;
  }
];
export type Month = Week[];
export type Week = CalendarDate[];
export type CalendarDate = {
  year: number;
  month: number;
  date: number;
  isToday: boolean;
  isSelectedDate: boolean;
  isSelectedMonth: boolean;
};
type Select = (utcDateString: UTCDateString) => void;

export const useCalendar: UseCalendar = (props) => {
  type GetWeek = (startSunday: Date, today: Date, selected: Date) => Week;
  const getWeek: GetWeek = (startSunday, today, selected) => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const d = addDays(startSunday, dayIndex);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        date === today.getDate();
      const isSelectedMonth =
        year === selected.getFullYear() && month === selected.getMonth() + 1;
      const isSelectedDate = isSelectedMonth && date === selected.getDate();

      return {
        year,
        month,
        date,
        isToday,
        isSelectedDate,
        isSelectedMonth,
      };
    });
  };

  const [selected, setSelected] = useState<UTCDateString>(props.selected);

  const week = useMemo<Week>(() => {
    const todaysDate = new Date(props.today);
    const selectedDate = new Date(selected);
    const selectedWeekFirstDate = subDays(selectedDate, getDay(selectedDate));

    return getWeek(selectedWeekFirstDate, todaysDate, selectedDate);
  }, [props.today, selected]);
  const month = useMemo<Month>(() => {
    const todaysDate = new Date(props.today);
    const selectedDate = new Date(selected);
    const selectedMonthFirstDate = startOfMonth(selectedDate);
    const selectedMonthCalendarFirstDate = subDays(
      selectedMonthFirstDate,
      getDay(selectedMonthFirstDate)
    );

    return [0, 1, 2, 3, 4, 5].map((weekIndex) => {
      const start = addDays(selectedMonthCalendarFirstDate, weekIndex * 7);

      return getWeek(start, todaysDate, selectedDate);
    });
  }, [props.today, selected]);

  const select = useCallback<Select>((utcDateString) => {
    setSelected(utcDateString);
  }, []);

  return [
    { month, week },
    {
      select,
    },
  ];
};
