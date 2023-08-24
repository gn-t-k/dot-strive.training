"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { MuscleForm } from "../../../_components/muscle-form";
import { updateMuscle } from "../../_repositories/update-muscle";

import type { SubmitMuscle } from "../../../_components/muscle-form";
import type { MuscleField } from "../../../_hooks/use-muscle-form";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  muscle: Muscle;
  registeredMuscles: Muscle[];
};
export const EditMuscle: FC<Props> = (props) => {
  const { renderToast } = useToast();
  const router = useRouter();

  const defaultValues: MuscleField = {
    name: props.muscle.name,
  };
  const submitMuscle = useCallback<SubmitMuscle>(
    async (fieldValues) => {
      const result = await updateMuscle({
        traineeId: props.traineeId,
        muscleId: props.muscle.id,
        muscleName: fieldValues.name,
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
