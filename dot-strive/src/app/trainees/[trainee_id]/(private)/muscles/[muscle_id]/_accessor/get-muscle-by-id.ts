import { validateMuscle } from "@/app/_schemas/muscle";

import { getFetcher } from "../../../../../../_utils/get-fetcher";

import type { Muscle } from "@/app/_schemas/muscle";
import type { Result } from "neverthrow";

type GetMuscleById = (props: Props) => Promise<Result<Muscle, Error>>;
type Props = {
  traineeId: string;
  muscleId: string;
};
export const getMuscleById: GetMuscleById = async (props) => {
  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/muscles/${props.muscleId}`
  );
  const data = await response.json();
  const muscle = validateMuscle(data);

  return muscle;
};
