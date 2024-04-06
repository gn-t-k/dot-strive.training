import type { SubmissionResult } from "@conform-to/react";
import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import { getExercisesByTraineeId } from "app/features/exercise/get-exercises-by-trainee-id";
import { validateExercise } from "app/features/exercise/schema";
import { updateExercise } from "app/features/exercise/update-exercise";
import { getMusclesByTraineeId } from "app/features/muscle/get-muscles-by-trainee-id";
import type { Trainee } from "app/features/trainee/schema";
import { parseWithValibot } from "conform-to-valibot";
import { checkOwnExercise } from "./check-own-exercise";
import { getExerciseFormSchema } from "./exercise-form";

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
  const exerciseId = formData.get("id")?.toString();
  if (!exerciseId) {
    return json({
      action: "update",
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

  const [getMusclesResult, getExercisesResult] = await Promise.all([
    getMusclesByTraineeId(context)(trainee.id),
    getExercisesByTraineeId(context)(trainee.id),
  ]);
  if (
    !(
      getMusclesResult.result === "success" &&
      getExercisesResult.result === "success"
    )
  ) {
    return json({
      action: "update",
      success: false,
      description: "get muscles and exercises failed.",
    });
  }
  const [registeredMuscles, registeredExercises] = [
    getMusclesResult.data,
    getExercisesResult.data,
  ];

  const beforeName =
    registeredExercises.find((exercise) => exercise.id === exerciseId)?.name ??
    null;
  const submission = parseWithValibot(formData, {
    schema: getExerciseFormSchema({
      registeredMuscles,
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

  const exercise = validateExercise({
    id: exerciseId,
    name: submission.value.name,
    // TODO: 二重ループなくせる？
    targets: submission.value.targets.flatMap((target) => {
      const muscle = registeredMuscles.find((muscle) => muscle.id === target);
      return muscle ? [{ id: muscle.id, name: muscle.name }] : [];
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
