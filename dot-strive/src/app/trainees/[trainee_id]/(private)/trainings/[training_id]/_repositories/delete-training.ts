import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";

type DeleteTraining = (props: Props) => Promise<Result<Training, Error>>;
type Props = {
  traineeId: string;
  trainingId: string;
};
export const deleteTraining: DeleteTraining = async (props) => {
  const response = await getFetcher({
    method: "DELETE",
  })(`/api/trainees/${props.traineeId}/trainings/${props.trainingId}`);
  const data = await response.json();
  const result = validateTraining(data);

  return result;
};
