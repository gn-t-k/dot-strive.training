import { endOfWeek, startOfWeek, subDays } from "date-fns";
import { err, ok } from "neverthrow";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Training } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { Result } from "neverthrow";

type GetWeeklyTrainings = (props: Props) => Promise<Result<Training[], Error>>;
type Props = {
  traineeId: string;
  date: UTCDateString;
};
export const getWeeklyTrainings: GetWeeklyTrainings = async (props) => {
  const date = new Date(props.date);
  const startDate = startOfWeek(date);
  const endDate = endOfWeek(date);
  const bufferedStartDate = subDays(startDate, 1);
  const bufferedEndDate = subDays(endDate, 1);

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
