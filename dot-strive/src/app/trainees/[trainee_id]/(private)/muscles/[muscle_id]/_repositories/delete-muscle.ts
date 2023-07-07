import { validateMuscle } from "@/app/_schemas/muscle";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Muscle } from "@/app/_schemas/muscle";
import type { Result } from "neverthrow";

type DeleteMuscle = (props: Props) => Promise<Result<Muscle, Error>>;
type Props = {
  traineeId: string;
  muscleId: string;
};
export const deleteMuscle: DeleteMuscle = async (props) => {
  const response = await getFetcher({
    method: "DELETE",
  })(`/api/trainees/${props.traineeId}/muscles/${props.muscleId}`);
  const data = await response.json();
  const result = validateMuscle(data);

  return result;
};
