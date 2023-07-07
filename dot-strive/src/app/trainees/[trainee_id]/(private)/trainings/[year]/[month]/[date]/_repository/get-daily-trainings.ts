import { endOfDay } from "date-fns";
import { err, ok } from "neverthrow";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";

type GetDailyTrainings = (props: Props) => Promise<Result<Training[], Error>>;
type Props = {
  traineeId: string;
  year: string;
  month: string;
  date: string;
};
export const getDailyTrainings: GetDailyTrainings = async (props) => {
  const startOfDate = new Date(`${props.year}-${props.month}-${props.date}`);
  const endOfDate = endOfDay(startOfDate);

  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/trainings/${encodeURIComponent(
      startOfDate.toISOString()
    )}/${encodeURIComponent(endOfDate.toISOString())}`
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
