import { stack } from "styled-system/patterns";

import { getMonthlyTrainings } from "../_repositories/get-monthly-trainings";

import type { FC } from "react";

type Props = {
  traineeId: string;
  year: string;
  month: string;
};
export const MonthlyTrainingList: FC<Props> = async (props) => {
  const result = await getMonthlyTrainings({
    traineeId: props.traineeId,
    year: props.year,
    month: props.month,
  });

  if (result.isErr()) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = result.value;

  return (
    <ul className={stack({ direction: "column" })}>
      {trainings.map((training) => {
        return <li key={training.id}>{JSON.stringify(training)}</li>;
      })}
    </ul>
  );
};
