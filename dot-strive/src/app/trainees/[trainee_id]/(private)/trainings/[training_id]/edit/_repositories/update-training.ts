import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";

type UpdateTraining = (props: Props) => Promise<Result<Training, Error>>;
type Props = {
  traineeId: string;
  training: Training;
};
export const updateTraining: UpdateTraining = async (props) => {
  const response = await getFetcher({ method: "POST" })(
    `/api/trainees/${props.traineeId}/trainings`,
    JSON.stringify(props.training)
  );
  const data = await response.json();

  return validateTraining(data);
};
