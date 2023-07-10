import { err } from "neverthrow";
import { ulid } from "ulid";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import { getAllExercisesBySession } from "../../_repositories/get-all-exercises-by-session";

import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";

type RegisterTraining = (props: Props) => Promise<Result<Training, Error>>;
type Props = {
  traineeId: string;
  date: string;
  records: {
    exerciseId: string;
    sets: {
      weight: number;
      repetition: number;
      order: number;
    }[];
    memo: string;
    order: number;
  }[];
};
export const registerTraining: RegisterTraining = async (props) => {
  const getExercisesResult = await getAllExercisesBySession({
    traineeId: props.traineeId,
  });
  if (getExercisesResult.isErr()) {
    return err(
      new Error(
        `exercisesを取得できませんでした: ${getExercisesResult.error.message}}`
      )
    );
  }
  const registeredExercises = getExercisesResult.value;

  const validateTrainingResult = validateTraining({
    id: ulid(),
    date: new Date(props.date).toISOString(),
    records: props.records.flatMap((record) => {
      const exercise = registeredExercises.find(
        (exercise) => exercise.id === record.exerciseId
      );

      if (exercise === undefined) {
        return [];
      }

      return [
        {
          id: ulid(),
          exercise,
          sets: record.sets.map((set) => {
            return {
              id: ulid(),
              weight: set.weight,
              repetition: set.repetition,
              order: set.order,
            };
          }),
          memo: record.memo,
          order: record.order,
        },
      ];
    }),
  });
  if (validateTrainingResult.isErr()) {
    return validateTrainingResult;
  }
  const training = validateTrainingResult.value;

  const response = await getFetcher({ method: "POST" })(
    `/api/trainees/${props.traineeId}/trainings`,
    JSON.stringify(training)
  );
  const data = await response.json();

  return validateTraining(data);
};
