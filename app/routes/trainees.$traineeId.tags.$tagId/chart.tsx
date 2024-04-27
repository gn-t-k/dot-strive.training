import { getDaysInMonth } from "date-fns";
import type { FC } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type Training = {
  date: string;
  setCount: number;
};

// TODO: 選択されている日付のBarを強調したい
type Props = {
  defaultMonth: Date;
  trainings: Training[];
};
export const Chart: FC<Props> = ({ defaultMonth, trainings }) => {
  const data = Array.from(
    { length: getDaysInMonth(defaultMonth) },
    (_, i) => `${i + 1}`,
  ).map((date) => ({
    date,
    setCount:
      trainings.find((training) => training.date === date)?.setCount ?? 0,
  }));
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
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
