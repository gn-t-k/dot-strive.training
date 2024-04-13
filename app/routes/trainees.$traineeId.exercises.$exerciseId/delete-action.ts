import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import { deleteExercise } from "app/features/exercise/delete-exercise";
import type { Trainee } from "app/features/trainee/schema";
import { checkOwnExercise } from "../../features/exercise/check-own-exercise";

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
  const exerciseId = formData.get("id")?.toString();
  if (!exerciseId) {
    return json({
      action: "delete",
      success: false,
      description: 'get formData "id" failed',
    });
  }

  const checkOwnExerciseResult = await checkOwnExercise(context)({
    traineeId: trainee.id,
    exerciseId,
  });
  if (checkOwnExerciseResult.result === "failure") {
    return json({
      action: "delete",
      success: false,
      description: "check own exercise failed",
    });
  }
  const isOwnExercise = checkOwnExerciseResult.data;
  if (!isOwnExercise) {
    return json({
      action: "delete",
      success: false,
      description: "not own exercise",
    });
  }

  const deleteResult = await deleteExercise(context)({ id: exerciseId });
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
