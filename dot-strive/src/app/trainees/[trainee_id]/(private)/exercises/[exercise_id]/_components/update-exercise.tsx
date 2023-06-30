"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { UpdateExerciseForm } from "./update-exercise-form";

import type { AfterDelete, AfterUpdate } from "./update-exercise-form";
import type { Exercise } from "@/app/_schemas/exercise";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  exercise: Exercise;
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
};
export const UpdateExercise: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const afterUpdate = useCallback<AfterUpdate>(
    (fieldValues, result) => {
      router.refresh();
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
    [props.exercise.name, renderToast, router]
  );
  const afterDelete = useCallback<AfterDelete>(
    (result) => {
      router.refresh();
      if (result.isOk()) {
        router.replace(`/trainees/${props.traineeId}/exercises`);
      }
      renderToast(
        result.isOk()
          ? {
              title: `種目「${props.exercise.name}」を削除しました`,
              variant: "success",
            }
          : {
              title: `種目「${props.exercise.name}」の削除に失敗しました`,
              variant: "error",
            }
      );
    },
    [props.exercise.name, props.traineeId, renderToast, router]
  );

  return (
    <UpdateExerciseForm
      traineeId={props.traineeId}
      exercise={props.exercise}
      registeredMuscles={props.registeredMuscles}
      registeredExercises={props.registeredExercises}
      afterUpdate={afterUpdate}
      afterDelete={afterDelete}
    />
  );
};
