"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { registerOrUpdateMuscle } from "@/app/_actions/register-or-update-muscle";
import { validateMuscle, type Muscle } from "@/app/_schemas/muscle";

import { MuscleForm } from "./muscle-form";
import { useToast } from "./use-toast";

import type { MuscleField, SubmitMuscle } from "./muscle-form";
import type { FC } from "react";

type Props = {
  traineeId: string;
  muscle: Muscle;
  registeredMuscles: Muscle[];
};
export const MuscleEditingForm: FC<Props> = (props) => {
  const { renderToast } = useToast();
  const router = useRouter();

  const defaultValues: MuscleField = {
    name: props.muscle.name,
  };
  const submitMuscle = useCallback<SubmitMuscle>(
    async (fieldValues) => {
      const validateMuscleResult = validateMuscle({
        id: props.muscle.id,
        name: fieldValues.name,
      });
      if (validateMuscleResult.isErr) {
        renderToast({
          title: "部位の更新に失敗しました",
          variant: "error",
        });

        return;
      }
      const muscle = validateMuscleResult.value;

      const result = await registerOrUpdateMuscle({
        traineeId: props.traineeId,
        muscle,
      });

      router.refresh();
      renderToast(
        result.isOk
          ? {
              title: `部位「${props.muscle.name}」の名前を「${result.value.name}」に更新しました`,
              variant: "success",
            }
          : { title: "部位の更新に失敗しました", variant: "error" }
      );

      router.refresh();
      router.push(`/trainees/${props.traineeId}`);
    },
    [props.muscle.id, props.muscle.name, props.traineeId, renderToast, router]
  );

  return (
    <MuscleForm
      submitMuscleLabel="部位を更新する"
      registeredMuscles={props.registeredMuscles}
      defaultValues={defaultValues}
      submitMuscle={submitMuscle}
    />
  );
};
