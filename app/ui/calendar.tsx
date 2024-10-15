import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "app/libs/shadcn/utils";
import { Button, buttonVariants } from "app/ui/button";
import { format } from "date-fns";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ja}
      className={cn("p-3", className)}
      classNames={{
        months: "relative",
        month: "w-full space-y-4",
        nav: "absolute left-0 top-0 transform flex justify-between w-full",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2 justify-between",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 pb-3 font-normal aria-selected:opacity-100",
        ),
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        PreviousMonthButton: (props) => (
          <Button {...props} size="icon" variant="outline">
            <ChevronLeft />
          </Button>
        ),
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        NextMonthButton: (props) => (
          <Button {...props} size="icon" variant="outline">
            <ChevronRight />
          </Button>
        ),
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        MonthCaption: (props) => (
          <span className="flex justify-center items-center h-10">
            {format(props.calendarMonth.date, "yyyy年MM月")}
          </span>
        ),
      }}
      modifiersClassNames={{
        events:
          "after:absolute after:left-1/2 after:-translate-x-1/2 after:top-3/4 after:-translate-y-1/2 after:h-2 after:w-2 after:rounded-full after:bg-primary after:aria-selected:bg-primary-foreground",
      }}
      {...props}
    />
  );
};
Calendar.displayName = "Calendar";

export { Calendar };
