"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { ExerciseForm } from "../../_components/exercise-form";
import { registerExercise } from "../../_repositories/register-exercise";

import type { SubmitExercise } from "../../_components/exercise-form";
import type { Exercise } from "@/app/_schemas/exercise";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
};
export const RegisterExercise: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const submitExercise = useCallback<SubmitExercise>(
    async (fieldValues) => {
      const result = await registerExercise({
        traineeId: props.traineeId,
        exerciseName: fieldValues.name,
        targetIds: fieldValues.targets,
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
      router.push(`/trainees/${props.traineeId}/exercises`);
    },
    [props.traineeId, renderToast, router]
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
