import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import { getExerciseTrainingsByWeight } from "app/features/training/get-exercise-trainings-by-weight";

type SearchByWeightAction = (props: {
  formData: FormData;
  context: AppLoadContext;
}) => Promise<
  TypedResponse<
    | {
        action: "searchByWeight";
        success: false;
        description: string;
      }
    | {
        action: "searchByWeight";
        success: true;
        data: Payload;
      }
  >
>;
type Payload = {
  id: string;
  date: Date;
  sessions: {
    id: string;
    memo: string;
    exercise: {
      id: string;
      name: string;
    };
    sets: {
      id: string;
      weight: number;
      repetition: number;
      rpe: number;
      estimatedMaximumWeight: number;
    }[];
  }[];
}[];
export const searchByWeightAction: SearchByWeightAction = async ({
  formData,
  context,
}) => {
  const exerciseId = formData.get("exerciseId")?.toString();
  const weight = Number(formData.get("weight")?.toString());
  if (!exerciseId || Number.isNaN(weight)) {
    return json({
      action: "searchByWeight",
      success: false as const,
      description: 'get formData "exerciseId" or "weight" failed',
    });
  }
  const result = await getExerciseTrainingsByWeight(context)(
    exerciseId,
    weight,
  );
  if (result.result === "failure") {
    return json({
      action: "searchByWeight",
      success: false as const,
      description: "findMaximumRepsByWeight failed",
    });
  }

  return json({
    action: "searchByWeight",
    success: true as const,
    data: result.data,
  });
};
