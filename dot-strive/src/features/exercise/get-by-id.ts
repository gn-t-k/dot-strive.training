import { getFetcher } from "../http-client/fetcher";

import type { Exercise } from ".";
import type { Result } from "neverthrow";

import { validateExercise } from ".";

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
