import { validateMuscle } from "@/features/muscle";

import type { Fetcher } from "../http-client/fetcher";
import type { Muscle } from "@/features/muscle";
import type { Result } from "neverthrow";

type GetMuscleById = (
  deps: Deps
) => (props: Props) => Promise<Result<Muscle, Error>>;
type Deps = {
  fetcher: Fetcher;
};
type Props = {
  traineeId: string;
  muscleId: string;
};
export const getMuscleById: GetMuscleById = (deps) => async (props) => {
  const response = await deps.fetcher(
    `/api/trainees/${props.traineeId}/muscles/${props.muscleId}`
  );
  const data = await response.json();
  const muscle = validateMuscle(data);

  return muscle;
};
