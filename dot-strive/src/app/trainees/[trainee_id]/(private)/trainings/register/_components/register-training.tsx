"use client";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_hooks/use-toast";
import { TrainingForm } from "@/app/trainees/[trainee_id]/(private)/trainings/_components/training-form";

import type { Exercise } from "@/app/_schemas/exercise";
import type { ComponentProps, FC } from "react";

type Props = {
  traineeId: string;
  registeredExercises: Exercise[];
};
export const RegisterTraining: FC<Props> = async (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const afterSubmit: NonNullable<
    ComponentProps<typeof TrainingForm>["afterSubmit"]
  > = (fieldValues, result) => {
    router.refresh();
    renderToast(
      result.isOk()
        ? {
            title: "トレーニングを登録しました",
            variant: "success",
          }
        : {
            title: "トレーニングの登録に失敗しました",
            variant: "error",
          }
    );
    router.push(`/trainees/${props.traineeId}/trainings`);
  };

  return (
    <TrainingForm
      submitButtonLabel="トレーニングを登録する"
      registeredExercises={props.registeredExercises}
      traineeId={props.traineeId}
      afterSubmit={afterSubmit}
    />
  );
};
