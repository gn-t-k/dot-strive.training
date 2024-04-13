import type { SubmissionResult } from "@conform-to/react";
import { createId } from "@paralleldrive/cuid2";
import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import { createExercise } from "app/features/exercise/create-exercise";
import { getExercisesByTraineeId } from "app/features/exercise/get-exercises-by-trainee-id";
import { validateExercise } from "app/features/exercise/schema";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import type { Trainee } from "app/features/trainee/schema";
import { parseWithValibot } from "conform-to-valibot";
import { getExerciseFormSchema } from "../../features/exercise/exercise-form";

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
  const [getTagsResult, getExercisesResult] = await Promise.all([
    getTagsByTraineeId(context)(trainee.id),
    getExercisesByTraineeId(context)(trainee.id),
  ]);
  if (
    !(
      getTagsResult.result === "success" &&
      getExercisesResult.result === "success"
    )
  ) {
    return json({
      action: "create",
      success: false,
      description: "get tags and exercises failed.",
    });
  }
  const [registeredTags, registeredExercises] = [
    getTagsResult.data,
    getExercisesResult.data,
  ];

  const submission = parseWithValibot(formData, {
    schema: getExerciseFormSchema({
      registeredTags,
      registeredExercises,
      beforeName: null,
    }),
  });
  if (submission.status !== "success") {
    return json({
      action: "create",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const exercise = validateExercise({
    id: createId(),
    name: submission.value.name,
    // TODO: 二重ループなくせる？
    tags: submission.value.tags.flatMap((tagId) => {
      const tag = registeredTags.find((tag) => tag.id === tagId);
      return tag ? [{ id: tag.id, name: tag.name }] : [];
    }),
  });
  if (!exercise) {
    return json({
      action: "create",
      success: false,
      description: "domain validation failed",
    });
  }

  const createResult = await createExercise(context)({
    exercise,
    traineeId: trainee.id,
  });
  if (createResult.result === "failure") {
    return json({
      action: "create",
      success: false,
      description: "create data failed",
    });
  }

  return json({
    action: "create",
    success: true,
    description: "success",
    submission: submission.reply(),
  });
};
