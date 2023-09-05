import { addMinutes, endOfMonth, getMonth, startOfWeek } from "date-fns";

import { TrainingDetailView } from "./training-detail";
import { getTrainingsByDateRange } from "../_actions/get-trainings-by-date-range";

import type { Option } from "../_utils/option";
import type { FC } from "react";

type Props = {
  year: number;
  month: number;
  day: Option<number>;
  traineeId: string;
  timezoneOffset: number;
};
export const TrainingListMonth: FC<Props> = async (props) => {
  const firstDayOfMonth = new Date(props.year, props.month);
  const topLeftDate = addMinutes(
    startOfWeek(firstDayOfMonth),
    props.timezoneOffset
  );
  const bottomRightDate = addMinutes(
    endOfMonth(firstDayOfMonth),
    props.timezoneOffset
  );
  const getTrainingsResult = await getTrainingsByDateRange({
    traineeId: props.traineeId,
    from: topLeftDate,
    to: bottomRightDate,
  });
  if (getTrainingsResult.isErr) {
    return <p>トレーニングの取得に失敗しました</p>;
  }
  const trainings = getTrainingsResult.value
    .filter((training) => {
      const trainingMonth = getMonth(new Date(training.date));

      return trainingMonth === props.month;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
