import { endOfWeek, format, startOfWeek } from "date-fns";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { err, ok } from "@/app/_utils/result";

import type { Result } from "@/app/_utils/result";

type GetWeeklyNumberOfSets = (props: Props) => Promise<Result<number, Error>>;
type Props = {
  traineeId: string;
  muscleId: string;
  date: Date;
};
export const getWeeklyNumberOfSets: GetWeeklyNumberOfSets = async (props) => {
  const from = startOfWeek(props.date);
  const to = endOfWeek(props.date);
  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/trainings/muscles/${
      props.muscleId
    }/dates/${format(from, "yyyy-MM-dd")}/${format(to, "yyyy-MM-dd")}`
  );
  const data = await response.json();

  if (!Array.isArray(data)) {
    return err(new Error("trainingsの取得に失敗しました"));
  }
  const trainings = data.flatMap((training) => {
    const validateTrainingResult = validateTraining(training);

    return validateTrainingResult.isOk ? [validateTrainingResult.value] : [];
  });
  const weeklyNumberOfSets = trainings
    .flatMap((training) => training.records)
    .filter((record) =>
      record.exercise.targets.some((target) => target.id === props.muscleId)
    )
    .flatMap((record) => record.sets).length;

  return ok(weeklyNumberOfSets);
};
