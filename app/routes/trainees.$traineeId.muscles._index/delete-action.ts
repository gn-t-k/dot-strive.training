import {
  type AppLoadContext,
  type TypedResponse,
  json,
} from "@remix-run/cloudflare";
import { checkOwnMuscle } from "app/features/muscle/check-own-muscle";
import { deleteMuscle } from "app/features/muscle/delete-muscle";
import type { Trainee } from "app/features/trainee/schema";

type DeleteAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  trainee: Trainee;
}) => Promise<
  TypedResponse<
    | {
        action: "delete";
        success: false;
        description: string;
      }
    | {
        action: "delete";
        success: true;
        description: string;
      }
  >
>;
export const deleteAction: DeleteAction = async ({
  formData,
  context,
  trainee,
}) => {
  const muscleId = formData.get("id")?.toString();
  if (!muscleId) {
    return json({
      action: "delete",
      success: false,
      description: 'formData "id" is not found',
    });
  }

  const checkOwnMuscleResult = await checkOwnMuscle(context)({
    traineeId: trainee.id,
    muscleId,
  });
  if (checkOwnMuscleResult.result === "failure") {
    return json({
      action: "delete",
      success: false,
      description: "check own muscle failed",
    });
  }
  const isOwnMuscle = checkOwnMuscleResult.data;
  if (!isOwnMuscle) {
    return json({
      action: "delete",
      success: false,
      description: "not own muscle",
    });
  }

  const deleteResult = await deleteMuscle(context)({ id: muscleId });
  if (deleteResult.result === "failure") {
    return json({
      action: "delete",
      success: false,
      description: "delete data failed",
    });
  }

  return json({
    action: "delete",
    success: true,
    description: "success",
  });
};
