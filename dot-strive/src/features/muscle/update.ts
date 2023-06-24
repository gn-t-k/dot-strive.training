import type { Muscle } from ".";
import type { Mutator } from "../http-client/mutator";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

type UpdateMuscle = (
  deps: Deps
) => (props: Props) => Promise<Result<Muscle, Error>>;
type Deps = {
  mutator: Mutator;
};
type Props = {
  traineeId: string;
  muscleId: string;
  muscleName: string;
};
export const updateMuscle: UpdateMuscle = (deps) => async (props) => {
  const validateMuscleResult = validateMuscle({
    id: props.muscleId,
    name: props.muscleName,
  });
  if (validateMuscleResult.isErr()) {
    return validateMuscleResult;
  }

  const response = await deps.mutator(
    `/api/trainees/${props.traineeId}/muscles/${props.muscleId}`,
    JSON.stringify(validateMuscleResult.value)
  );
  const data = await response.json();

  return validateMuscle(data);
};
