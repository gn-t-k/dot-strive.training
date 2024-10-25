import { determineDateFormat } from "app/utils/determin-date-format";
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
  date: string;
  selectDate: (date: string | undefined) => void;
  trainings: {
    date: Date;
    sets: {
      weight: number;
    }[];
  }[];
};
export const MaximumWeightChart: FC<Props> = ({
  date,
  selectDate,
  trainings,
}) => {
  const data = useMemo(() => {
    return Array.from(
      { length: getDaysInMonth(date) },
      (_, i) => `${i + 1}`,
    ).map((date) => ({
      date,
      maximumWeight: trainings
        .find((training) => format(training.date, "d") === date)
        ?.sets.sort((a, b) => b.weight - a.weight)
        .at(0)?.weight,
    }));
  }, [date, trainings]);

  const isDateSelected = determineDateFormat(date) === "yyyy-MM-dd";

  const onClick = useCallback(
    (props_: unknown) => {
      const { payload } = props_ as { payload: (typeof data)[number] };
      selectDate(
        isDateSelected
          ? undefined
          : format(setDate(date, Number(payload.date)), "yyyy-MM-dd"),
      );
    },
    [date, selectDate, isDateSelected],
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
          stroke={isDateSelected ? "#888888" : "currentColor"}
          strokeWidth={2}
          connectNulls
          type="monotone"
          dot={{
            onClick,
          }}
        />
        <Legend
          formatter={(value) =>
            value === "maximumWeight"
              ? `${format(date, "yyyy年M月")}の最大重量[kg]`
              : value
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
