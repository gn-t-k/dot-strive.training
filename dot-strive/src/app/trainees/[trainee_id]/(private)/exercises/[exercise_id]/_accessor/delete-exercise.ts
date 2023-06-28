import { validateExercise } from "../../../../../../_schemas/exercise";
import { getFetcher } from "../../../../../../_utils/get-fetcher";

import type { Exercise } from "../../../../../../_schemas/exercise";
import type { Result } from "neverthrow";

type DeleteExercise = (props: Props) => Promise<Result<Exercise, Error>>;
type Props = {
  traineeId: string;
  exerciseId: string;
};
export const deleteExercise: DeleteExercise = async (props) => {
  const response = await getFetcher({
    method: "DELETE",
  })(`/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`);
  const data = await response.json();
  const result = validateExercise(data);

  return result;
};
