import { addDays, endOfMonth, subDays } from "date-fns";
import { err, ok } from "neverthrow";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";

type GetMonthlyTrainings = (props: Props) => Promise<Result<Training[], Error>>;
type Props = {
  traineeId: string;
  year: string;
  month: string;
};
export const getMonthlyTrainings: GetMonthlyTrainings = async (props) => {
  const startDate = new Date(`${props.year}-${props.month}`);
  const endDate = endOfMonth(startDate);
  const bufferedStartDate = subDays(startDate, 7);
  const bufferedEndDate = addDays(endDate, 7);

  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/trainings/dates/${encodeURIComponent(
      bufferedStartDate.toISOString()
    )}/${encodeURIComponent(bufferedEndDate.toISOString())}`
  );
  const data = await response.json();

  if (!Array.isArray(data)) {
    return err(new Error("トレーニングの取得に失敗しました"));
  }

  const trainings = data.flatMap((training) => {
    const result = validateTraining(training);

    return result.isErr() ? [] : [result.value];
  });

  return ok(trainings);
};
