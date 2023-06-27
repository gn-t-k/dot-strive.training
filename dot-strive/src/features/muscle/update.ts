import { getMutator } from "../http-client/mutator";

import type { Muscle } from ".";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

type UpdateMuscle = (props: Props) => Promise<Result<Muscle, Error>>;
type Props = {
  traineeId: string;
  muscleId: string;
  muscleName: string;
};
export const updateMuscle: UpdateMuscle = async (props) => {
  const validateMuscleResult = validateMuscle({
    id: props.muscleId,
    name: props.muscleName,
  });
  if (validateMuscleResult.isErr()) {
    return validateMuscleResult;
  }

  const response = await getMutator({
    method: "PATCH",
  })(
    `/api/trainees/${props.traineeId}/muscles/${props.muscleId}`,
    JSON.stringify(validateMuscleResult.value)
  );
  const data = await response.json();

  return validateMuscle(data);
};
