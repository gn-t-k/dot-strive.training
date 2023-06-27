import { getFetcher } from "../http-client/fetcher";

import type { Result } from "neverthrow";

import { validateTrainee, type Trainee } from ".";

type GetTraineeBySession = () => Promise<Result<Trainee, Error>>;
export const getTraineeBySession: GetTraineeBySession = async () => {
  const response = await getFetcher()("/api/trainees/me");
  const data = await response.json();
  const trainee = validateTrainee(data);

  return trainee;
};
