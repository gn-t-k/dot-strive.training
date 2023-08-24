import { getWeeklyNumberOfSets } from "../_repositories/get-weekly-number-of-sets";

import type { FC } from "react";

type Props = {
  traineeId: string;
  muscleId: string;
};
export const WeeklyNumberOfSets: FC<Props> = async (props) => {
  const getWeeklyNumberOfSetsResult = await getWeeklyNumberOfSets({
    traineeId: props.traineeId,
    muscleId: props.muscleId,
    date: new Date(),
  });
  if (getWeeklyNumberOfSetsResult.isErr) {
    return <p>今週の合計セット数の取得に失敗しました</p>;
  }
  const weeklyNumberOfSets = getWeeklyNumberOfSetsResult.value;

  return <p>{weeklyNumberOfSets}セット</p>;
};
