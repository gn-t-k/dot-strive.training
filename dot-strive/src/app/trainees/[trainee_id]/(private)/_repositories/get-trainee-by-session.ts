import { validateTrainee, type Trainee } from "@/app/_schemas/trainee";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Result } from "@/app/_utils/result";

type GetTraineeBySession = () => Promise<Result<Trainee, Error>>;
export const getTraineeBySession: GetTraineeBySession = async () => {
  const response = await getFetcher()("/api/trainees/me");
  const data = await response.json();
  const trainee = validateTrainee(data);

  return trainee;
};
