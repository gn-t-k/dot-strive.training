import { format, getDaysInMonth } from "date-fns";
import { type FC, useMemo } from "react";
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
      estimatedMaximumWeight: number;
    }[];
  }[];
};
export const MaximumWeightChart: FC<Props> = ({
  defaultMonth,
  selectDate: _selectDate,
  selectedDate: _selectedDate,
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
        ?.sets.sort(
          (a, b) => a.estimatedMaximumWeight - b.estimatedMaximumWeight,
        )
        .at(0)?.estimatedMaximumWeight,
    }));
  }, [defaultMonth, trainings]);

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
        />
        <Legend
          formatter={(value) =>
            value === "maximumWeight" ? "推定1RM[kg]" : value
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
