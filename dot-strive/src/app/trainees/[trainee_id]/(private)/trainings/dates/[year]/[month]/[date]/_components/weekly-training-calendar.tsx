import { TrainingCalendarWeek } from "@/app/_components/training-calendar-week";

import { getWeeklyTrainings } from "../_repository/get-weekly-trainings";

import type { TraineeId } from "@/app/_schemas/trainee";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: TraineeId;
  selected: UTCDateString;
};
export const WeeklyTrainingCalendar: FC<Props> = async (props) => {
  const result = await getWeeklyTrainings({
    traineeId: props.traineeId,
    date: props.selected,
  });
  if (result.isErr()) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = result.value;

  return (
    <TrainingCalendarWeek
      traineeId={props.traineeId}
      selected={props.selected}
      trainings={trainings}
    />
  );
};
