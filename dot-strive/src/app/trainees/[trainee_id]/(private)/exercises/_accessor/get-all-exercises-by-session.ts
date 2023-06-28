import { err, ok } from "neverthrow";

import { validateExercise } from "../../../../../_schemas/exercise";
import { getFetcher } from "../../../../../_utils/get-fetcher";

import type { Exercise } from "../../../../../_schemas/exercise";
import type { Result } from "neverthrow";

type GetAllExercisesBySession = (
  props: Props
) => Promise<Result<Exercise[], Error>>;
type Props = {
  traineeId: string;
};
export const getAllExercisesBySession: GetAllExercisesBySession = async (
  props
) => {
  const response = await getFetcher()(
    `/api/trainees/${props.traineeId}/exercises`
  );
  const data = await response.json();

  if (!Array.isArray(data)) {
    return err(new Error("種目の取得に失敗しました"));
  }

  const exercises = data.flatMap((exercise) => {
    const result = validateExercise(exercise);

    return result.isErr() ? [] : [result.value];
  });

  return ok(exercises);
};
