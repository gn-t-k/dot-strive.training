import { validateMuscle } from "../../../../../../_schemas/muscle";
import { getFetcher } from "../../../../../../_utils/get-fetcher";

import type { Muscle } from "../../../../../../_schemas/muscle";
import type { Result } from "neverthrow";

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

  const response = await getFetcher({
    method: "PATCH",
  })(
    `/api/trainees/${props.traineeId}/muscles/${props.muscleId}`,
    JSON.stringify(validateMuscleResult.value)
  );
  const data = await response.json();

  return validateMuscle(data);
};
