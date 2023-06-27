import { err, type Result } from "neverthrow";

import { getAllMusclesBySession } from "../muscle/get-all-by-session";

import type { Exercise } from ".";
import type { Fetcher } from "../http-client/fetcher";
import type { Mutator } from "../http-client/mutator";

import { validateExercise } from ".";

type UpdateExercise = (
  deps: Deps
) => (props: Props) => Promise<Result<Exercise, Error>>;
type Deps = {
  fetcher: Fetcher;
  mutator: Mutator;
};
type Props = {
  traineeId: string;
  exerciseId: string;
  exerciseName: string;
  targetIds: string[];
};
export const updateExercise: UpdateExercise = (deps) => async (props) => {
  const targetsResult = await getAllMusclesBySession({ fetcher: deps.fetcher })(
    { traineeId: props.traineeId }
  );
  if (targetsResult.isErr()) {
    return err(new Error("対象部位の取得に失敗しました"));
  }

  const targets = targetsResult.value.filter((target) =>
    props.targetIds.includes(target.id)
  );

  const validateExerciseResult = validateExercise({
    id: props.exerciseId,
    name: props.exerciseName,
    targets,
  });
  if (validateExerciseResult.isErr()) {
    return validateExerciseResult;
  }

  const response = await deps.mutator(
    `/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`,
    JSON.stringify(validateExerciseResult.value)
  );
  const data = await response.json();

  return validateExercise(data);
};
