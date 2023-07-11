"use client";

import { addDays, getDay, startOfMonth, subDays } from "date-fns";
import { useCallback, useState } from "react";

import type { UTCDateString } from "@/app/_schemas/utc-date-string";

type UseCalendar = (props: {
  today: UTCDateString;
  selected: UTCDateString;
}) => [
  { calendar: Calendar },
  {
    select: Select;
  }
];
type Calendar = Week[];
type Week = CalendarDate[];
type CalendarDate = {
  year: number;
  month: number;
  date: number;
  isToday: boolean;
  isSelectedDate: boolean;
  isSelectedMonth: boolean;
};
type Select = (utcDateString: UTCDateString) => void;

export const useCalendar: UseCalendar = (props) => {
  type GetCalendar = (
    today: UTCDateString,
    selected: UTCDateString
  ) => Calendar;
  const getCalendar: GetCalendar = (today, selected) => {
    const todaysDate = new Date(today);
    const selectedDate = new Date(selected);
    const selectedMonthFirstDate = startOfMonth(selectedDate);
    const selectedMonthCalendarFirstDate = subDays(
      selectedMonthFirstDate,
      getDay(selectedMonthFirstDate)
    );

    return [0, 1, 2, 3, 4, 5].map((weekIndex) => {
      const start = addDays(selectedMonthCalendarFirstDate, weekIndex * 7);

      return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
        const d = addDays(start, dayIndex);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const date = d.getDate();
        const isToday =
          year === todaysDate.getFullYear() &&
          month === todaysDate.getMonth() + 1 &&
          date === todaysDate.getDate();
        const isSelectedMonth =
          year === selectedDate.getFullYear() &&
          month === selectedDate.getMonth() + 1;
        const isSelectedDate =
          isSelectedMonth && date === selectedDate.getDate();

        return {
          year,
          month,
          date,
          isToday,
          isSelectedDate,
          isSelectedMonth,
        };
      });
    });
  };
  const initialCalendar = getCalendar(props.today, props.selected);
  const [calendar, setCalendar] = useState<Calendar>(initialCalendar);

  const select = useCallback<Select>(
    (utcDateString) => {
      const calendar = getCalendar(props.today, utcDateString);

      setCalendar(calendar);
    },
    [props.today]
  );

  return [
    { calendar },
    {
      select,
    },
  ];
};
