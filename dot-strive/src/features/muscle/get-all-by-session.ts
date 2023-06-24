import { err, ok } from "neverthrow";

import type { Muscle } from ".";
import type { Fetcher } from "../http-client/fetcher";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

type GetAllMusclesBySession = (
  deps: Deps
) => (props: Props) => Promise<Result<Muscle[], Error>>;
type Deps = {
  fetcher: Fetcher;
};
type Props = {
  traineeId: string;
};
export const getAllMusclesBySession: GetAllMusclesBySession =
  (deps) => async (props) => {
    const response = await deps.fetcher(
      `/api/trainees/${props.traineeId}/muscles`
    );
    const data = await response.json();

    if (!Array.isArray(data)) {
      return err(new Error("部位の取得に失敗しました"));
    }

    const muscles = data.flatMap((muscle) => {
      const result = validateMuscle(muscle);

      return result.isErr() ? [] : [result.value];
    });

    return ok(muscles);
  };
