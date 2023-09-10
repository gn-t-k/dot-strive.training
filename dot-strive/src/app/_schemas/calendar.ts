import {
  addMonths,
  addWeeks,
  getMonth,
  getWeek,
  getYear,
  subMonths,
  subWeeks,
} from "date-fns";
import { z } from "zod";

export const calendarSchema = z
  .union([
    z.object({
      view: z.literal("year"),
      year: z.number(),
      month: z.number(),
      day: z.number(),
      week: z.undefined(),
    }),
    z.object({
      view: z.literal("year"),
      year: z.number(),
      month: z.number(),
      day: z.undefined(),
      week: z.undefined(),
    }),
    z.object({
      view: z.literal("year"),
      year: z.number(),
      month: z.undefined(),
      day: z.undefined(),
      week: z.undefined(),
    }),
    z.object({
      view: z.literal("month"),
      year: z.number(),
      month: z.number(),
      day: z.number(),
      week: z.undefined(),
    }),
    z.object({
      view: z.literal("month"),
      year: z.number(),
      month: z.number(),
      day: z.undefined(),
      week: z.undefined(),
    }),
    z.object({
      view: z.literal("week"),
      year: z.number(),
      month: z.number(),
      day: z.number(),
      week: z.undefined(),
    }),
    z.object({
      view: z.literal("week"),
      year: z.number(),
      month: z.undefined(),
      day: z.undefined(),
      week: z.number(),
    }),
  ])
  .refine(
    (data) => {
      switch (data.view) {
        case "year":
          return data.month !== undefined && data.day !== undefined
            ? !isNaN(new Date(data.year, data.month, data.day).getTime())
            : data.month !== undefined && data.day === undefined
            ? !isNaN(new Date(data.year, data.month).getTime())
            : data.month === undefined && data.day === undefined
            ? !isNaN(new Date(data.year, 0, 1).getTime())
            : false;
        case "month":
          return data.day !== undefined
            ? !isNaN(new Date(data.year, data.month, data.day).getTime())
            : !isNaN(new Date(data.year, data.month).getTime());
        case "week":
          return data.month !== undefined && data.day !== undefined
            ? !isNaN(new Date(data.year, data.month, data.day).getTime())
            : !isNaN(new Date(data.year, 0, 1 + (data.week - 1) * 7).getTime());
      }
    },
    {
      message: "Invalid date",
      path: ["date"],
    }
  );
export type Calendar = z.infer<typeof calendarSchema>;

type ChangeViewToYear = (
  calendar: Calendar
) => Extract<Calendar, { view: "year" }>;
export const changeViewToYear: ChangeViewToYear = (calendar) => {
  const view = "year";
  switch (calendar.view) {
    case "year":
      return calendar;
    case "month":
      return calendar.day === undefined
        ? {
            view,
            year: calendar.year,
            month: calendar.month,
            day: undefined,
            week: calendar.week,
          }
        : {
            view,
            year: calendar.year,
            month: calendar.month,
            day: calendar.day,
            week: calendar.week,
          };
    case "week":
      return calendar.week === undefined
        ? {
            view,
            year: calendar.year,
            month: calendar.month,
            day: calendar.day,
            week: calendar.week,
          }
        : ((): Extract<Calendar, { view: "year" }> => {
            const date = getDateFromWeek(calendar);
            return {
              view,
              year: getYear(date),
              month: getMonth(date),
              day: undefined,
              week: undefined,
            };
          })();
  }
};

type ChangeViewToMonth = (
  calendar: Calendar
) => Extract<Calendar, { view: "month" }>;
export const changeViewToMonth: ChangeViewToMonth = (calendar) => {
  const view = "month";
  switch (calendar.view) {
    case "year": {
      return calendar.month === undefined
        ? {
            view,
            year: calendar.year,
            month: 0,
            day: undefined,
            week: undefined,
          }
        : calendar.day === undefined
        ? {
            view,
            year: calendar.year,
            month: calendar.month,
            day: undefined,
            week: undefined,
          }
        : {
            view,
            year: calendar.year,
            month: calendar.month,
            day: calendar.day,
            week: calendar.week,
          };
    }
    case "month":
      return calendar;
    case "week":
      return calendar.week === undefined
        ? {
            view,
            year: calendar.year,
            month: calendar.month,
            day: calendar.day,
            week: calendar.week,
          }
        : {
            view,
            year: calendar.year,
            month: getMonth(getDateFromWeek(calendar)),
            day: undefined,
            week: undefined,
          };
  }
};

type ChangeViewToWeek = (
  calendar: Calendar
) => Extract<Calendar, { view: "week" }>;
export const changeViewToWeek: ChangeViewToWeek = (calendar) => {
  const view = "week";
  switch (calendar.view) {
    case "year":
      return calendar.month === undefined
        ? {
            view,
            year: calendar.year,
            month: undefined,
            day: undefined,
            week: getWeek(new Date(calendar.year, 0).getTime()),
          }
        : calendar.day === undefined
        ? {
            view,
            year: calendar.year,
            month: undefined,
            day: undefined,
            week: getWeek(new Date(calendar.year, calendar.month).getTime()),
          }
        : {
            view,
            year: calendar.year,
            month: calendar.month,
            day: calendar.day,
            week: undefined,
          };
    case "month":
      return calendar.day === undefined
        ? {
            view,
            year: calendar.year,
            month: undefined,
            day: undefined,
            week: getWeek(new Date(calendar.year, calendar.month).getTime()),
          }
        : {
            view,
            year: calendar.year,
            month: calendar.month,
            day: calendar.day,
            week: calendar.week,
          };
    case "week":
      return calendar;
  }
};

type SelectDate = (
  calendar: Calendar
) => (date: { year: number; month: number; day: number }) => Calendar;
export const selectDate: SelectDate = (calendar) => (date) => {
  return {
    view: calendar.view,
    year: date.year,
    month: date.month,
    day: date.day,
    week: undefined,
  };
};

type DeselectDate = (calendar: Calendar) => Calendar;
export const deselectDate: DeselectDate = (calendar) => {
  switch (calendar.view) {
    case "year":
      return {
        view: calendar.view,
        year: calendar.year,
        month: undefined,
        day: undefined,
        week: undefined,
      };
    case "month":
      return {
        view: calendar.view,
        year: calendar.year,
        month: calendar.month,
        day: undefined,
        week: undefined,
      };
    case "week":
      return {
        view: calendar.view,
        year: calendar.year,
        month: undefined,
        day: undefined,
        week:
          calendar.month !== undefined && calendar.day !== undefined
            ? getWeek(
                new Date(calendar.year, calendar.month, calendar.day).getTime()
              )
            : calendar.week,
      };
  }
};
type GetPrevMonth = (
  calendar: Extract<Calendar, { view: "month" }>
) => Extract<Calendar, { view: "month"; day?: undefined }>;
export const getPrevMonth: GetPrevMonth = (calendar) => {
  const date = new Date(calendar.year, calendar.month).getTime();
  const prevMonthDate = subMonths(date, 1);
  return {
    view: calendar.view,
    year: getYear(prevMonthDate),
    month: getMonth(prevMonthDate),
    day: undefined,
    week: undefined,
  };
};

type GetNextMonth = (
  calendar: Extract<Calendar, { view: "month" }>
) => Extract<Calendar, { view: "month"; day?: undefined }>;
export const getNextMonth: GetNextMonth = (calendar) => {
  const date = new Date(calendar.year, calendar.month).getTime();
  const nextMonthDate = addMonths(date, 1);
  return {
    view: calendar.view,
    year: getYear(nextMonthDate),
    month: getMonth(nextMonthDate),
    day: undefined,
    week: undefined,
  };
};

type GetPrevWeek = (
  calendar: Extract<Calendar, { view: "week" }>
) => Extract<Calendar, { view: "week"; week: number }>;
export const getPrevWeek: GetPrevWeek = (calendar) => {
  const date =
    calendar.week === undefined
      ? getDateFromCalendar(calendar)
      : getDateFromWeek(calendar);
  const prevWeekDate = subWeeks(date, 1);

  return {
    view: calendar.view,
    year: getYear(prevWeekDate),
    month: undefined,
    day: undefined,
    week: getWeek(prevWeekDate),
  };
};

type GetNextWeek = (
  calendar: Extract<Calendar, { view: "week" }>
) => Extract<Calendar, { view: "week"; week: number }>;
export const getNextWeek: GetNextWeek = (calendar) => {
  const date =
    calendar.week === undefined
      ? getDateFromCalendar(calendar)
      : getDateFromWeek(calendar);
  const nextWeekDate = addWeeks(date, 1);

  return {
    view: calendar.view,
    year: getYear(nextWeekDate),
    month: undefined,
    day: undefined,
    week: getWeek(nextWeekDate),
  };
};

type GetDateFromCalendar = (
  calendar: Extract<Calendar, { year: number; month: number; day: number }>
) => number;
export const getDateFromCalendar: GetDateFromCalendar = (calendar) => {
  return new Date(calendar.year, calendar.month, calendar.day).getTime();
};

type GetDateFromWeek = (
  calendar: Extract<Calendar, { week: number }>
) => number;
export const getDateFromWeek: GetDateFromWeek = (calendar) => {
  return new Date(calendar.year, 0, 1 + (calendar.week - 1) * 7).getTime();
};

type GetSearchParams = (calendar: Calendar) => URLSearchParams;
export const getSearchParams: GetSearchParams = (calendar) => {
  const searchParams = new URLSearchParams([
    ["view", String(calendar.view)],
    ["year", String(calendar.year)],
  ]);
  if (calendar.month !== undefined) {
    searchParams.append("month", String(calendar.month));
  }
  if (calendar.day !== undefined) {
    searchParams.append("day", String(calendar.day));
  }
  if (calendar.week !== undefined) {
    searchParams.append("week", String(calendar.week));
  }
  return searchParams;
};
