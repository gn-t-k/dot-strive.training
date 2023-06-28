import { err, ok } from "neverthrow";

import { validateMuscle } from "../../../../_schemas/muscle";
import { getFetcher } from "../../../../_utils/get-fetcher";

import type { Muscle } from "../../../../_schemas/muscle";
import type { Result } from "neverthrow";

type GetAllMusclesBySession = (
  props: Props
) => Promise<Result<Muscle[], Error>>;
type Props = {
  traineeId: string;
};
export const getAllMusclesBySession: GetAllMusclesBySession = async (props) => {
  const response = await getFetcher()(
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
