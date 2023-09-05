import { addMinutes, endOfDay, startOfDay } from "date-fns";

import { TrainingDetailView } from "./training-detail";
import { getTrainingsByDateRange } from "../_actions/get-trainings-by-date-range";

import type { FC } from "react";

type Props = {
  year: number;
  month: number;
  day: number;
  traineeId: string;
  timezoneOffset: number;
};
export const TrainingListDay: FC<Props> = async (props) => {
  const date = new Date(props.year, props.month, props.day);
  const start = addMinutes(startOfDay(date), props.timezoneOffset);
  const end = addMinutes(endOfDay(date), props.timezoneOffset);
  const getTrainingsResult = await getTrainingsByDateRange({
    traineeId: props.traineeId,
    from: start,
    to: end,
  });
  if (getTrainingsResult.isErr) {
    return <p>トレーニングの取得に失敗しました</p>;
  }
  const trainings = getTrainingsResult.value;

  return (
    <ul>
      {trainings.map((training) => {
        return (
          <li key={training.id}>
            <TrainingDetailView training={training} />
          </li>
        );
      })}
    </ul>
  );
};
