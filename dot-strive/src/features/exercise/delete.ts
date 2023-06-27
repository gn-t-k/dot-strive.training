import { getMutator } from "../http-client/mutator";

import type { Exercise } from ".";
import type { Result } from "neverthrow";

import { validateExercise } from ".";

type DeleteExercise = (props: Props) => Promise<Result<Exercise, Error>>;
type Props = {
  traineeId: string;
  exerciseId: string;
};
export const deleteExercise: DeleteExercise = async (props) => {
  const response = await getMutator({
    method: "DELETE",
  })(`/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`);
  const data = await response.json();
  const result = validateExercise(data);

  return result;
};
