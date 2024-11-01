import type { SubmissionResult } from "@conform-to/react";
import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import { getExercisesByTraineeId } from "app/features/exercise/get-exercises-by-trainee-id";
import { validateExercise } from "app/features/exercise/schema";
import { updateExercise } from "app/features/exercise/update-exercise";
import { getTagsByTraineeId } from "app/features/tag/get-tags-by-trainee-id";
import { parseWithValibot } from "conform-to-valibot";
import { checkOwnExercise } from "../../features/exercise/check-own-exercise";
import { getExerciseFormSchema } from "../temp.trainees.$traineeId.exercises/exercise-form";

type UpdateAction = (props: {
  formData: FormData;
  context: AppLoadContext;
  traineeId: string;
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
  traineeId,
}) => {
  const exerciseId = formData.get("id")?.toString();
  if (!exerciseId) {
    return json({
      action: "update",
      success: false,
      description: 'get formData "id" failed',
    });
  }

  const checkOwnExerciseResult = await checkOwnExercise(context)({
    traineeId: traineeId,
    exerciseId,
  });
  if (checkOwnExerciseResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "check own exercise failed",
    });
  }
  const isOwnExercise = checkOwnExerciseResult.data;
  if (!isOwnExercise) {
    return json({
      action: "update",
      success: false,
      description: "not own exercise",
    });
  }

  const [getTagsResult, getExercisesResult] = await Promise.all([
    getTagsByTraineeId(context)(traineeId),
    getExercisesByTraineeId(context)(traineeId),
  ]);
  if (
    !(
      getTagsResult.result === "success" &&
      getExercisesResult.result === "success"
    )
  ) {
    return json({
      action: "update",
      success: false,
      description: "get tags and exercises failed.",
    });
  }
  const [registeredTags, registeredExercises] = [
    getTagsResult.data,
    getExercisesResult.data,
  ];

  const beforeName =
    registeredExercises.find((exercise) => exercise.id === exerciseId)?.name ??
    null;
  const submission = parseWithValibot(formData, {
    schema: getExerciseFormSchema({
      registeredTags,
      registeredExercises,
      beforeName,
    }),
  });
  if (submission.status !== "success") {
    return json({
      action: "update",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const tagMap = new Map(registeredTags.map((tag) => [tag.id, tag.name]));
  const tags =
    typeof submission.value.tags === "string"
      ? [submission.value.tags]
      : submission.value.tags;
  const exercise = validateExercise({
    id: exerciseId,
    name: submission.value.name,
    tags: tags.flatMap((tagId) => {
      const tagName = tagMap.get(tagId);
      return tagName ? [{ id: tagId, name: tagName }] : [];
    }),
  });
  if (!exercise) {
    return json({
      action: "update",
      success: false,
      description: "domain validation failed",
    });
  }

  const updateResult = await updateExercise(context)(exercise);
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
