import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "app/libs/shadcn/utils";
import { buttonVariants } from "app/ui/button";

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
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "w-full space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        nav_button_previous: "absolute left-1",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        head_row: "flex justify-between",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2 justify-between",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 pb-3 font-normal aria-selected:opacity-100",
        ),
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_range_end: "day-range-end",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_today: "bg-accent text-accent-foreground",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_disabled: "text-muted-foreground opacity-50",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        IconLeft: (_props) => <ChevronLeft className="size-4" />,
        // biome-ignore lint/style/useNamingConvention: ライブラリ指定のため
        IconRight: (_props) => <ChevronRight className="size-4" />,
      }}
      modifiersClassNames={{
        events:
          "after:absolute after:top-6 after:h-2 after:w-2 after:rounded-full after:bg-primary after:aria-selected:bg-primary-foreground",
      }}
      {...props}
    />
  );
};
Calendar.displayName = "Calendar";

export { Calendar };
