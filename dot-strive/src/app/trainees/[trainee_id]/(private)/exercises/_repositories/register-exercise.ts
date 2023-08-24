import { ulid } from "ulid";

import { validateExercise } from "@/app/_schemas/exercise";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { err } from "@/app/_utils/result";

import { getAllMusclesBySession } from "../../_repositories/get-all-muscles-by-session";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Result } from "@/app/_utils/result";

type RegisterExercise = (props: Props) => Promise<Result<Exercise, Error>>;
type Props = {
  traineeId: string;
  exerciseName: string;
  targetIds: string[];
};
export const registerExercise: RegisterExercise = async (props) => {
  const getMusclesResult = await getAllMusclesBySession({
    traineeId: props.traineeId,
  });
  if (getMusclesResult.isErr) {
    return err(new Error("musclesを取得できませんでした"));
  }
  const muscles = getMusclesResult.value;
  const targets = muscles.filter((muscle) =>
    props.targetIds.includes(muscle.id)
  );

  const validateExerciseResult = validateExercise({
    id: ulid(),
    name: props.exerciseName,
    targets,
  });
  if (validateExerciseResult.isErr) {
    return validateExerciseResult;
  }
  const exercise = validateExerciseResult.value;

  const response = await getFetcher({ method: "POST" })(
    `/api/trainees/${props.traineeId}/exercises`,
    JSON.stringify(exercise)
  );
  const data = await response.json();

  return validateExercise(data);
};
