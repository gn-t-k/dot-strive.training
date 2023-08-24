import { validateExercise } from "@/app/_schemas/exercise";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { err, ok } from "@/app/_utils/result";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Result } from "@/app/_utils/result";

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

    return result.isErr ? [] : [result.value];
  });

  return ok(exercises);
};
