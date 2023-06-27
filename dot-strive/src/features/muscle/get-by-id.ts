import { validateMuscle } from "@/features/muscle";

import { getFetcher } from "../http-client/fetcher";

import type { Muscle } from "@/features/muscle";
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
