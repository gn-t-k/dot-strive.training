"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { DeleteTrainingButton } from "./delete-training-button";

import type { Training } from "@/app/_schemas/training";
import type { ComponentProps, FC } from "react";

type Props = {
  traineeId: string;
  training: Training;
};
export const DeleteTraining: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const afterDelete = useCallback<
    ComponentProps<typeof DeleteTrainingButton>["afterDelete"]
  >(
    (result) => {
      renderToast(
        result.isOk()
          ? {
              title: "トレーニングを削除しました",
              variant: "success",
            }
          : {
              title: "トレーニングの削除に失敗しました",
              variant: "error",
            }
      );
      if (result.isOk()) {
        router.push(`/trainees/${props.traineeId}/trainings`);
      }
    },
    [props.traineeId, renderToast, router]
  );

  return (
    <DeleteTrainingButton
      traineeId={props.traineeId}
      training={props.training}
      afterDelete={afterDelete}
    />
  );
};
