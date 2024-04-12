import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import type { Trainee } from "app/features/trainee/schema";
import { checkOwnTraining } from "app/features/training/check-own-training";
import { deleteTraining } from "app/features/training/delete-training";

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
  const trainingId = formData.get("id")?.toString();
  if (!trainingId) {
    return json({
      action: "delete",
      success: false,
      description: 'get formData "id" failed',
    });
  }

  const checkOwnTrainingResult = await checkOwnTraining(context)({
    traineeId: trainee.id,
    trainingId,
  });
  if (checkOwnTrainingResult.result === "failure") {
    return json({
      action: "delete",
      success: false,
      description: "check own training failed",
    });
  }
  const isOwnTraining = checkOwnTrainingResult.data;
  if (!isOwnTraining) {
    return json({
      action: "delete",
      success: false,
      description: "not own training",
    });
  }

  const deleteResult = await deleteTraining(context)({ id: trainingId });
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
