import type { Fetcher } from "../http-client/fetcher";
import type { Result } from "neverthrow";

import { validateTrainee, type Trainee } from ".";

type GetTraineeBySession = (
  deps: Deps
) => () => Promise<Result<Trainee, Error>>;
type Deps = {
  fetcher: Fetcher;
};
export const getTraineeBySession: GetTraineeBySession = (deps) => async () => {
  const response = await deps.fetcher("/api/trainees/me");
  const data = await response.json();
  const trainee = validateTrainee(data);

  return trainee;
};
