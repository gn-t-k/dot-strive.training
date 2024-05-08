import { format, getDaysInMonth, setDate } from "date-fns";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  defaultMonth: Date;
  selectedDate: Date | undefined;
  selectDate: (date: Date | undefined) => void;
  trainings: {
    date: Date;
    setCount: number;
  }[];
};
export const SetCountChart: FC<Props> = ({
  defaultMonth,
  selectDate,
  selectedDate,
  trainings,
}) => {
  const data = useMemo(() => {
    return Array.from(
      { length: getDaysInMonth(defaultMonth) },
      (_, i) => `${i + 1}`,
    ).map((date) => ({
      date,
      setCount:
        trainings.find((training) => format(training.date, "d") === date)
          ?.setCount ?? 0,
    }));
  }, [defaultMonth, trainings]);
  const onClickCell = useCallback<(date: string) => MouseEventHandler>(
    (date) => (_) => {
      selectDate(
        selectedDate ? undefined : setDate(defaultMonth, Number(date)),
      );
    },
    [defaultMonth, selectedDate, selectDate],
  );

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}セット`}
          minTickGap={1}
        />
        <Bar
          dataKey="setCount"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        >
          {data.map((entry) => (
            <Cell
              key={entry.date}
              className={
                selectedDate === undefined ||
                format(selectedDate, "d") === entry.date
                  ? "fill-primary"
                  : "fill-primary/30"
              }
              onClick={onClickCell(entry.date)}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
