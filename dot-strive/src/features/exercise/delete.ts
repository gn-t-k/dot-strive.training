import type { Exercise } from ".";
import type { Mutator } from "../http-client/mutator";
import type { Result } from "neverthrow";

import { validateExercise } from ".";

type DeleteExercise = (
  deps: Deps
) => (props: Props) => Promise<Result<Exercise, Error>>;
type Deps = {
  mutator: Mutator;
};
type Props = {
  traineeId: string;
  exerciseId: string;
};
export const deleteExercise: DeleteExercise = (deps) => async (props) => {
  const response = await deps.mutator(
    `/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`
  );
  const data = await response.json();
  const result = validateExercise(data);

  return result;
};
