"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { registerOrUpdateExercise } from "@/app/_actions/register-or-update-exercise";
import { ExerciseForm } from "@/app/_components/exercise-form";
import { validateExercise, type Exercise } from "@/app/_schemas/exercise";

import { useToast } from "./use-toast";

import type {
  ExerciseField,
  SubmitExercise,
} from "@/app/_components/exercise-form";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  exercise: Exercise;
  registeredExercises: Exercise[];
  registeredMuscles: Muscle[];
};
export const ExerciseEditingForm: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const defaultValues: ExerciseField = {
    name: props.exercise.name,
    targets: props.exercise.targets.map((target) => target.id),
  };
  const submitExercise = useCallback<SubmitExercise>(
    async (fieldValues) => {
      const targets = props.registeredMuscles.filter((muscle) =>
        fieldValues.targets.includes(muscle.id)
      );
      const validateExerciseResult = validateExercise({
        id: props.exercise.id,
        name: fieldValues.name,
        targets,
      });
      if (validateExerciseResult.isErr) {
        renderToast({
          title: `種目「${props.exercise.name}」の更新に失敗しました`,
          variant: "error",
        });

        return;
      }
      const exercise = validateExerciseResult.value;

      const result = await registerOrUpdateExercise({
        traineeId: props.traineeId,
        exercise,
      });

      router.refresh();
      if (result.isOk) {
        router.push(
          `/trainees/${props.traineeId}/exercises/${props.exercise.id}`
        );
      }
      renderToast(
        result.isOk
          ? {
              title: `種目「${props.exercise.name}」を更新しました`,
              variant: "success",
            }
          : {
              title: `種目「${props.exercise.name}」の更新に失敗しました`,
              variant: "error",
            }
      );
    },
    [
      props.exercise.id,
      props.exercise.name,
      props.registeredMuscles,
      props.traineeId,
      renderToast,
      router,
    ]
  );

  return (
    <ExerciseForm
      submitButtonLabel="種目を更新する"
      defaultValues={defaultValues}
      registeredExercises={props.registeredExercises}
      registeredMuscles={props.registeredMuscles}
      submitExercise={submitExercise}
    />
  );
};
