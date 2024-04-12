import type { SubmissionResult } from "@conform-to/react";
import { json } from "@remix-run/cloudflare";
import type { AppLoadContext, TypedResponse } from "@remix-run/cloudflare";
import { getExercisesWithTagsByTraineeId } from "app/features/exercise/get-exercises-with-tags-by-trainee-id";
import { validateExercise } from "app/features/exercise/schema";
import type { Trainee } from "app/features/trainee/schema";
import { checkOwnTraining } from "app/features/training/check-own-training";
import { validateTraining } from "app/features/training/schema";
import { getTrainingFormSchema } from "app/features/training/training-form";
import { updateTraining } from "app/features/training/update-training";
import { parseWithValibot } from "conform-to-valibot";

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
  const trainingId = formData.get("id")?.toString();
  if (!trainingId) {
    return json({
      action: "update",
      success: false,
      description: 'formData "id" is not found',
    });
  }

  const checkOwnTrainingResult = await checkOwnTraining(context)({
    traineeId: trainee.id,
    trainingId,
  });
  if (checkOwnTrainingResult.result === "failure") {
    return json({
      action: "update",
      success: false,
      description: "check own training failed",
    });
  }
  const isOwnTraining = checkOwnTrainingResult.data;
  if (!isOwnTraining) {
    return json({
      action: "update",
      success: false,
      description: "not own training",
    });
  }

  const getExercisesResult = await getExercisesWithTagsByTraineeId(context)(
    trainee.id,
  );
  if (getExercisesResult.result !== "success") {
    return json({
      action: "update",
      success: false,
      description: "get exercises failed",
    });
  }
  const registeredExercises = getExercisesResult.data;

  const submission = parseWithValibot(formData, {
    schema: getTrainingFormSchema(registeredExercises),
  });
  if (submission.status !== "success") {
    return json({
      action: "update",
      success: false,
      description: "form validation failed",
      submission: submission.reply(),
    });
  }

  const training = validateTraining({
    id: trainingId,
    date: new Date(submission.value.date),
    sessions: submission.value.sessions.flatMap((session) => {
      const exercise = validateExercise(
        registeredExercises.find(
          (registeredExercise) => registeredExercise.id === session.exerciseId,
        ),
      );
      if (!exercise) {
        return [];
      }

      return [
        {
          exercise,
          memo: session.memo,
          sets: session.sets,
        },
      ];
    }),
  });
  if (!training) {
    return json({
      action: "update",
      success: false,
      description: "domain validation failed",
    });
  }

  const updateResult = await updateTraining(context)({
    training,
  });
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
