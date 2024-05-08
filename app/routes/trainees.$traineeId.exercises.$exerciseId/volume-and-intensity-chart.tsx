import { format, getDaysInMonth, setDate } from "date-fns";
import { type FC, type MouseEventHandler, useCallback, useMemo } from "react";
import {
  Bar,
  Cell,
  ComposedChart,
  Legend,
  Line,
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
      repetition: number;
      estimatedMaximumWeight: number;
    }[];
  }[];
};
export const VolumeAndIntensityChart: FC<Props> = ({
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
      volume:
        trainings
          .find((training) => format(training.date, "d") === date)
          ?.sets.reduce((acc, cur) => acc + cur.weight * cur.repetition, 0) ??
        0,
      intensity:
        trainings
          .find((training) => format(training.date, "d") === date)
          ?.sets.sort(
            (a, b) => a.estimatedMaximumWeight - b.estimatedMaximumWeight,
          )
          .at(0)?.estimatedMaximumWeight ?? 0,
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
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data}>
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
          tickFormatter={(value) => `${value}`}
          minTickGap={1}
          yAxisId="left"
          label={{
            value: "ボリューム[kg]",
            angle: -90,
          }}
          className="text-xs"
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          minTickGap={1}
          yAxisId="right"
          orientation="right"
          label={{
            value: "推定1RM[kg]",
            angle: -90,
          }}
          className="text-xs"
        />
        <Bar
          dataKey="volume"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
          yAxisId="left"
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
        <Line dataKey="intensity" dot={false} yAxisId="right" />
        <Legend
          formatter={(value) => (
            <span className="text-sm">
              {value === "volume"
                ? "ボリューム[kg]"
                : value === "intensity"
                  ? "推定1RM[kg]"
                  : value}
            </span>
          )}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
