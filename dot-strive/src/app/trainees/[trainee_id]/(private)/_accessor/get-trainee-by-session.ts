import { validateTrainee, type Trainee } from "../../../../_schemas/trainee";
import { getFetcher } from "../../../../_utils/get-fetcher";

import type { Result } from "neverthrow";

type GetTraineeBySession = () => Promise<Result<Trainee, Error>>;
export const getTraineeBySession: GetTraineeBySession = async () => {
  const response = await getFetcher()("/api/trainees/me");
  const data = await response.json();
  const trainee = validateTrainee(data);

  return trainee;
};
