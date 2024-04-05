import type { SubmissionResult } from "@conform-to/react";
import {
  type AppLoadContext,
  type TypedResponse,
  json,
} from "@remix-run/cloudflare";
import { checkOwnMuscle } from "app/features/muscle/check-own-muscle";
import { getMusclesByTraineeId } from "app/features/muscle/get-muscles-by-trainee-id";
import { validateMuscle } from "app/features/muscle/schema";
import { updateMuscle } from "app/features/muscle/update-muscle";
import type { Trainee } from "app/features/trainee/schema";
import { parseWithValibot } from "conform-to-valibot";
import { getMuscleFormSchema } from "./muscle-form";

type UpdateAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  trainee: Trainee;
}) => Promise<
  TypedResponse<
    | {
        action: "update";
        success: false;
        description: string;
        submission?: SubmissionResult<string[]>;
      }
    | {
        action: "update";
        success: true;
        description: string;
        submission: SubmissionResult<string[]>;
      }
  >
>;
export const updateAction: UpdateAction = async ({
  formData,
  context,
  trainee,
}) => {
  const muscleId = formData.get("id")?.toString();
  if (!muscleId) {
    return json({
      action: "update",
      success: false,
      description: 'formData "id" is not found',
    });
  }

  const getMusclesResult = await getMusclesByTraineeId(context)(trainee.id);
  if (getMusclesResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "get muscles failed",
    });
  }
  const registeredMuscles = getMusclesResult.data;

  const beforeName = registeredMuscles.find(
    (muscle) => muscle.id === muscleId,
  )?.name;
  const submission = parseWithValibot(formData, {
    schema: getMuscleFormSchema({ registeredMuscles, beforeName }),
  });
  if (submission.status !== "success") {
    return json({
      action: "update",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const checkOwnMuscleResult = await checkOwnMuscle(context)({
    traineeId: trainee.id,
    muscleId,
  });
  if (checkOwnMuscleResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "check own muscle failed",
    });
  }
  const isOwnMuscle = checkOwnMuscleResult.data;
  if (!isOwnMuscle) {
    return json({
      action: "update",
      success: false,
      description: "not own muscle",
    });
  }

  const muscle = validateMuscle({
    id: muscleId,
    name: submission.value.name,
  });
  if (!muscle) {
    return json({
      action: "update",
      success: false,
      description: "domain validation failed",
    });
  }

  const updateResult = await updateMuscle(context)(muscle);
  if (updateResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "update data failed",
    });
  }

  return json({
    action: "update",
    success: true,
    description: "success",
    submission: submission.reply(),
  });
};
