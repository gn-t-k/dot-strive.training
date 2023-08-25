"use client";

import { useRouter } from "next/navigation";
import { useCallback, type FC } from "react";
import { ulid } from "ulid";

import { registerOrUpdateMuscle } from "@/app/_actions/register-or-update-muscle";
import { validateMuscle, type Muscle } from "@/app/_schemas/muscle";

import { MuscleForm } from "./muscle-form";
import { useToast } from "./use-toast";

import type { SubmitMuscle } from "./muscle-form";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
};
export const MuscleRegistrationForm: FC<Props> = (props) => {
  const { renderToast } = useToast();
  const router = useRouter();
  const submitMuscle = useCallback<SubmitMuscle>(
    async (fieldValues) => {
      const validateMuscleResult = validateMuscle({
        id: ulid(),
        name: fieldValues.name,
      });
      if (validateMuscleResult.isErr) {
        renderToast({
          title: `部位「${fieldValues.name}」の登録に失敗しました`,
          variant: "error",
        });

        return;
      }
      const muscle = validateMuscleResult.value;

      const result = await registerOrUpdateMuscle({
        traineeId: props.traineeId,
        muscle,
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
