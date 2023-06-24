import { ulid } from "ulid";

import type { Mutator } from "../http-client/mutator";
import type { Muscle } from "@/features/muscle";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

type RegisterMuscle = (
  deps: Deps
) => (props: Props) => Promise<Result<Muscle, Error>>;
type Deps = {
  mutator: Mutator;
};
type Props = {
  traineeId: string;
  muscleName: string;
};
export const registerMuscle: RegisterMuscle = (deps) => async (props) => {
  const validateMuscleResult = validateMuscle({
    id: ulid(),
    name: props.muscleName,
  });
  if (validateMuscleResult.isErr()) {
    return validateMuscleResult;
  }

  const response = await deps.mutator(
    `/api/trainees/${props.traineeId}/muscles`,
    JSON.stringify(validateMuscleResult.value)
  );
  const data = await response.json();

  return validateMuscle(data);
};
