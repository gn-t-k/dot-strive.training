import type { Muscle } from ".";
import type { Mutator } from "../http-client/mutator";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

type DeleteMuscle = (
  deps: Deps
) => (props: Props) => Promise<Result<Muscle, Error>>;
type Deps = {
  mutator: Mutator;
};
type Props = {
  traineeId: string;
  muscleId: string;
};
export const deleteMuscle: DeleteMuscle = (deps) => async (props) => {
  const response = await deps.mutator(
    `/api/trainees/${props.traineeId}/muscles/${props.muscleId}`
  );
  const data = await response.json();
  const result = validateMuscle(data);

  return result;
};
