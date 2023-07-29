import { WeeklyTrainingCalendarClient } from "./weekly-training-calendar-client";
import { getWeeklyTrainings } from "../_repository/get-weekly-trainings";

import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: string;
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
    <WeeklyTrainingCalendarClient
      traineeId={props.traineeId}
      selected={props.selected}
      trainings={trainings}
    />
  );
};
