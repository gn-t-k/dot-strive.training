import { err, ok } from "neverthrow";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Record } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { Result } from "neverthrow";

type GetExerciseRecords = (props: Props) => Promise<
  Result<
    {
      date: UTCDateString;
      record: Record;
    }[],
    Error
  >
>;
type Props = {
  traineeId: string;
  exerciseId: string;
};
export const getExerciseRecords: GetExerciseRecords = async (props) => {
  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/trainings/exercises/${props.exerciseId}`
  );
  const data = await response.json();

  if (!Array.isArray(data)) {
    return err(new Error("トレーニングの取得に失敗しました"));
  }
  const trainings = data.flatMap((training) => {
    const result = validateTraining(training);

    return result.isErr() ? [] : [result.value];
  });

  return ok(
    trainings.flatMap((training) => {
      const record = training.records.find(
        (record) => record.exercise.id === props.exerciseId
      );

      return record
        ? [
            {
              date: training.date,
              record,
            },
          ]
        : [];
    })
  );
};
