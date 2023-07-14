"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { ExerciseForm } from "../../../_components/exercise-form";
import { updateExercise } from "../../_repositories/update-exercise";

import type {
  ExerciseField,
  SubmitExercise,
} from "../../../_components/exercise-form";
import type { Exercise } from "@/app/_schemas/exercise";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  exercise: Exercise;
  registeredExercises: Exercise[];
  registeredMuscles: Muscle[];
};
export const EditExercise: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const defaultValues: ExerciseField = {
    name: props.exercise.name,
    targets: props.exercise.targets.map((target) => target.id),
  };
  const submitExercise = useCallback<SubmitExercise>(
    async (fieldValues) => {
      const result = await updateExercise({
        traineeId: props.traineeId,
        exerciseId: props.exercise.id,
        exerciseName: fieldValues.name,
        targetIds: fieldValues.targets,
      });

      router.refresh();
      if (result.isOk()) {
        router.push(
          `/trainees/${props.traineeId}/exercises/${props.exercise.id}`
        );
      }
      renderToast(
        result.isOk()
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
