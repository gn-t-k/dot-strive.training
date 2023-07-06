import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";

type GetTrainingById = (props: Props) => Promise<Result<Training, Error>>;
type Props = {
  traineeId: string;
  trainingId: string;
};
export const getTrainingById: GetTrainingById = async (props) => {
  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/trainings/${props.trainingId}`
  );
  const data = await response.json();
  const training = validateTraining(data);

  return training;
};
