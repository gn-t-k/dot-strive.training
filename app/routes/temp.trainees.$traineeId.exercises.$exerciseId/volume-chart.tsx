import { determineDateFormat } from "app/utils/determin-date-format";
import { format, getDaysInMonth, setDate } from "date-fns";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  date: string;
  selectDate: (date: string | undefined) => void;
  trainings: {
    date: Date;
    sets: {
      weight: number;
      repetition: number;
    }[];
  }[];
};
export const VolumeChart: FC<Props> = ({ date, selectDate, trainings }) => {
  const data = useMemo(() => {
    return Array.from(
      { length: getDaysInMonth(date) },
      (_, i) => `${i + 1}`,
    ).map((date) => ({
      date,
      volume:
        trainings
          .find((training) => format(training.date, "d") === date)
          ?.sets.reduce((acc, cur) => acc + cur.weight * cur.repetition, 0) ??
        0,
    }));
  }, [date, trainings]);

  const isDateSelected = determineDateFormat(date) === "yyyy-MM-dd";

  const onClickCell = useCallback<(day: string) => MouseEventHandler>(
    (day) => (_) => {
      selectDate(
        isDateSelected
          ? undefined
          : format(setDate(date, Number(day)), "yyyy-MM-dd"),
      );
    },
    [date, selectDate, isDateSelected],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          dataKey="volume"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          minTickGap={1}
        />
        <Bar
          dataKey="volume"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        >
          {data.map((entry) => (
            <Cell
              key={entry.date}
              className={
                !isDateSelected || format(date, "d") === entry.date
                  ? "fill-primary"
                  : "fill-primary/30"
              }
              onClick={onClickCell(entry.date)}
            />
          ))}
        </Bar>
        <Legend
          formatter={(value) => (
            <span className="text-sm">
              {value === "volume"
                ? `${format(date, "M")}月のトレーニングボリューム[kg]`
                : value}
            </span>
          )}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
