import { err, ok } from "neverthrow";

import type { Exercise } from ".";
import type { Fetcher } from "../http-client/fetcher";
import type { Result } from "neverthrow";

import { validateExercise } from ".";

type GetAllExercisesBySession = (
  deps: Deps
) => (props: Props) => Promise<Result<Exercise[], Error>>;
type Deps = {
  fetcher: Fetcher;
};
type Props = {
  traineeId: string;
};
export const getAllExercisesBySession: GetAllExercisesBySession =
  (deps) => async (props) => {
    const response = await deps.fetcher(
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
