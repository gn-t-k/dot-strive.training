import { err, ok } from "neverthrow";

import { getFetcher } from "../http-client/fetcher";

import type { Muscle } from ".";
import type { Result } from "neverthrow";

import { validateMuscle } from ".";

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
