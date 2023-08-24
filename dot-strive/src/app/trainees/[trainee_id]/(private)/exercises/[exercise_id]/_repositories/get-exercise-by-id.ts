import { validateExercise } from "@/app/_schemas/exercise";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Result } from "@/app/_utils/result";

type GetExerciseById = (props: Props) => Promise<Result<Exercise, Error>>;
type Props = {
  traineeId: string;
  exerciseId: string;
};
export const getExerciseById: GetExerciseById = async (props) => {
  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`
  );
  const data = await response.json();
  const exercise = validateExercise(data);

  return exercise;
};
