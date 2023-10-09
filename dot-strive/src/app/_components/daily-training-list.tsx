import { addMinutes, endOfDay, startOfDay } from "date-fns";
import Link from "next/link";

import { stack } from "styled-system/patterns";

import { TrainingDetail } from "./training-detail";
import { getTrainingsByDateRange } from "../_actions/get-trainings-by-date-range";

import type { UTCDateString } from "../_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: string;
  date: UTCDateString;
  timezoneOffset: number;
};
export const DailyTrainingList: FC<Props> = async (props) => {
  const startOfDate = startOfDay(new Date(props.date));
  const endOfDate = endOfDay(startOfDate);
  const offsetStartOfDate = addMinutes(
    startOfDate,
    props.timezoneOffset
  ).getTime();
  const offsetEndOfDate = addMinutes(endOfDate, props.timezoneOffset).getTime();

  const getTrainingsResult = await getTrainingsByDateRange({
    traineeId: props.traineeId,
    from: offsetStartOfDate,
    to: offsetEndOfDate,
  });
  if (getTrainingsResult.isErr) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = getTrainingsResult.value;

  return (
    <ul className={stack({ direction: "column", gap: 12, p: 4 })}>
      {trainings.map((training) => {
        return (
          <li key={training.id}>
            <Link
              href={`/trainees/${props.traineeId}/trainings/${training.id}`}
            >
              <TrainingDetail training={training} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
