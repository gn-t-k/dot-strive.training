import type { Exercise } from ".";
import type { Fetcher } from "../http-client/fetcher";
import type { Result } from "neverthrow";

import { validateExercise } from ".";

type GetExerciseById = (
  deps: Deps
) => (props: Props) => Promise<Result<Exercise, Error>>;
type Deps = {
  fetcher: Fetcher;
};
type Props = {
  traineeId: string;
  exerciseId: string;
};
export const getExerciseById: GetExerciseById = (deps) => async (props) => {
  const response = await deps.fetcher(
    `/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`
  );
  const data = await response.json();
  const exercise = validateExercise(data);

  return exercise;
};
