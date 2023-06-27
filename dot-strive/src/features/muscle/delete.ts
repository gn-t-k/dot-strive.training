import { getMutator } from "../http-client/mutator";

import type { Muscle } from ".";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

type DeleteMuscle = (props: Props) => Promise<Result<Muscle, Error>>;
type Props = {
  traineeId: string;
  muscleId: string;
};
export const deleteMuscle: DeleteMuscle = async (props) => {
  const response = await getMutator({
    method: "DELETE",
  })(`/api/trainees/${props.traineeId}/muscles/${props.muscleId}`);
  const data = await response.json();
  const result = validateMuscle(data);

  return result;
};
