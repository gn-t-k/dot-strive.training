"use client";

import { useRouter } from "next/navigation";
import { useCallback, type FC } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { MuscleForm } from "../../_components/muscle-form";
import { registerMuscle } from "../../_repositories/register-muscle";

import type { SubmitMuscle } from "../../_components/muscle-form";
import type { Muscle } from "@/app/_schemas/muscle";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
};
export const RegisterMuscle: FC<Props> = (props) => {
  const { renderToast } = useToast();
  const router = useRouter();
  const submitMuscle = useCallback<SubmitMuscle>(
    async (fieldValues) => {
      const result = await registerMuscle({
        traineeId: props.traineeId,
        muscleName: fieldValues.name,
      });

      renderToast(
        result.isOk
          ? {
              title: `部位「${fieldValues.name}」を登録しました`,
              variant: "success",
            }
          : {
              title: `部位「${fieldValues.name}」の登録に失敗しました`,
              variant: "error",
            }
      );

      router.refresh();
      router.push(`/trainees/${props.traineeId}/muscles`);
    },
    [props.traineeId, renderToast, router]
  );

  return (
    <MuscleForm
      submitMuscleLabel="部位を登録する"
      registeredMuscles={props.registeredMuscles}
      submitMuscle={submitMuscle}
    />
  );
};
