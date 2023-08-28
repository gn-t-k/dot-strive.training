"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ulid } from "ulid";

import { validateExercise, type Exercise } from "@/app/_schemas/exercise";

import { ExerciseForm } from "./exercise-form";
import { useToast } from "./use-toast";
import { registerOrUpdateExercise } from "../_actions/register-or-update-exercise";

import type { SubmitExercise } from "./exercise-form";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
};
export const ExerciseRegistrationForm: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const submitExercise = useCallback<SubmitExercise>(
    async (fieldValues) => {
      const targets = props.registeredMuscles.filter((muscle) =>
        fieldValues.targets.includes(muscle.id)
      );

      const validateExerciseResult = validateExercise({
        id: ulid(),
        name: fieldValues.name,
        targets,
      });
      if (validateExerciseResult.isErr) {
        renderToast({
          title: `種目「${fieldValues.name}」の登録に失敗しました`,
          variant: "error",
        });

        return;
      }
      const exercise = validateExerciseResult.value;
      const result = await registerOrUpdateExercise({
        traineeId: props.traineeId,
        exercise,
      });

      renderToast(
        result.isOk
          ? {
              title: `種目「${fieldValues.name}」を登録しました`,
              variant: "success",
            }
          : {
              title: `種目「${fieldValues.name}」の登録に失敗しました`,
              variant: "error",
            }
      );

      router.refresh();
      router.push(`/trainees/${props.traineeId}`);
    },
    [props.registeredMuscles, props.traineeId, renderToast, router]
  );

  return (
    <ExerciseForm
      submitButtonLabel="種目を登録する"
      registeredMuscles={props.registeredMuscles}
      registeredExercises={props.registeredExercises}
      submitExercise={submitExercise}
    />
  );
};
