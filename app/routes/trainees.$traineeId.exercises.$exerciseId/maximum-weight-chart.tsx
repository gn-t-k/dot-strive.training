import { format, getDaysInMonth, setDate } from "date-fns";
import { type FC, useCallback, useMemo } from "react";
import {
  Legend,
  Line,
  LineChart,
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
    sets: {
      weight: number;
    }[];
  }[];
};
export const MaximumWeightChart: FC<Props> = ({
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
      maximumWeight: trainings
        .find((training) => format(training.date, "d") === date)
        ?.sets.sort((a, b) => b.weight - a.weight)
        .at(0)?.weight,
    }));
  }, [defaultMonth, trainings]);
  const onClick = useCallback(
    (props_: unknown) => {
      const props = props_ as { payload: (typeof data)[number] };
      selectDate(
        selectedDate
          ? undefined
          : setDate(defaultMonth, Number(props.payload.date)),
      );
    },
    [defaultMonth, selectDate, selectedDate],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          dataKey="maximumWeight"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Line
          dataKey="maximumWeight"
          stroke="#888888"
          strokeWidth={2}
          connectNulls
          type="monotone"
          dot={{ onClick }}
        />
        <Legend
          formatter={(value) =>
            value === "maximumWeight"
              ? `${format(defaultMonth, "M")}月の最大重量[kg]`
              : value
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
