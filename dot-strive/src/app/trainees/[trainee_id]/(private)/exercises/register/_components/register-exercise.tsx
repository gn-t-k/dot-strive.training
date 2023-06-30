"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { RegisterExerciseForm } from "./register-exersise-form";

import type { AfterRegister } from "./register-exersise-form";
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
  const afterRegister = useCallback<AfterRegister>(
    (fieldValues, result) => {
      renderToast(
        result.isOk()
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
    <RegisterExerciseForm
      traineeId={props.traineeId}
      registeredMuscles={props.registeredMuscles}
      registeredExercises={props.registeredExercises}
      afterRegister={afterRegister}
    />
  );
};
