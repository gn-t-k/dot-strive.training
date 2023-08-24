import { ulid } from "ulid";

import { validateMuscle } from "@/app/_schemas/muscle";
import { getFetcher } from "@/app/_utils/get-fetcher";

import type { Muscle } from "@/app/_schemas/muscle";
import type { Result } from "@/app/_utils/result";

type RegisterMuscle = (props: Props) => Promise<Result<Muscle, Error>>;
type Props = {
  traineeId: string;
  muscleName: string;
};
export const registerMuscle: RegisterMuscle = async (props) => {
  const validateMuscleResult = validateMuscle({
    id: ulid(),
    name: props.muscleName,
  });
  if (validateMuscleResult.isErr) {
    return validateMuscleResult;
  }

  const response = await getFetcher({
    method: "POST",
  })(
    `/api/trainees/${props.traineeId}/muscles`,
    JSON.stringify(validateMuscleResult.value)
  );
  const data = await response.json();

  return validateMuscle(data);
};
