import { validateExercise } from "@/app/_schemas/exercise";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { err } from "@/app/_utils/result";
import { getAllMusclesBySession } from "@/app/trainees/[trainee_id]/(private)/_repositories/get-all-muscles-by-session";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Result } from "@/app/_utils/result";

type UpdateExercise = (props: Props) => Promise<Result<Exercise, Error>>;
type Props = {
  traineeId: string;
  exerciseId: string;
  exerciseName: string;
  targetIds: string[];
};
export const updateExercise: UpdateExercise = async (props) => {
  const targetsResult = await getAllMusclesBySession({
    traineeId: props.traineeId,
  });
  if (targetsResult.isErr) {
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
  if (validateExerciseResult.isErr) {
    return validateExerciseResult;
  }

  const response = await getFetcher({
    method: "PATCH",
  })(
    `/api/trainees/${props.traineeId}/exercises/${props.exerciseId}`,
    JSON.stringify(validateExerciseResult.value)
  );
  const data = await response.json();

  return validateExercise(data);
};
