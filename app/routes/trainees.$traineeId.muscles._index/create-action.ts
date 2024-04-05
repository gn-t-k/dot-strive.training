import type { SubmissionResult } from "@conform-to/react";
import { createId } from "@paralleldrive/cuid2";
import {
  type AppLoadContext,
  type TypedResponse,
  json,
} from "@remix-run/cloudflare";
import { createMuscle } from "app/features/muscle/create-muscle";
import { getMusclesByTraineeId } from "app/features/muscle/get-muscles-by-trainee-id";
import { validateMuscle } from "app/features/muscle/schema";
import type { Trainee } from "app/features/trainee/schema";
import { parseWithValibot } from "conform-to-valibot";
import { getMuscleFormSchema } from "./muscle-form";

type CreateAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  trainee: Trainee;
}) => Promise<
  TypedResponse<
    | {
        action: "create";
        success: false;
        description: string;
        submission?: SubmissionResult<string[]>;
      }
    | {
        action: "create";
        success: true;
        description: string;
        submission: SubmissionResult<string[]>;
      }
  >
>;
export const createAction: CreateAction = async ({
  formData,
  context,
  trainee,
}) => {
  const getMusclesResult = await getMusclesByTraineeId(context)(trainee.id);
  if (getMusclesResult.result === "failure") {
    return json({
      action: "create",
      success: false,
      description: "get muscles failed",
    });
  }
  const registeredMuscles = getMusclesResult.data;

  const submission = parseWithValibot(formData, {
    schema: getMuscleFormSchema({ registeredMuscles }),
  });
  if (submission.status !== "success") {
    return json({
      action: "create",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const muscle = validateMuscle({
    id: createId(),
    name: submission.value.name,
  });
  if (!muscle) {
    return json({
      action: "create",
      success: false,
      description: "domain validation failed",
    });
  }

  const createResult = await createMuscle(context)({
    muscle,
    traineeId: trainee.id,
  });
  if (createResult.result === "failure") {
    return json({
      action: "create",
      success: false,
      description: "create data failed ",
    });
  }

  return json({
    action: "create",
    success: true,
    description: "success",
    submission: submission.reply(),
  });
};
