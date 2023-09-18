"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ulid } from "ulid";

import { registerOrUpdateTraining } from "@/app/_actions/register-or-update-training";
import {
  validateTraining,
  type Training,
  getEstimatedMaximumWeight,
} from "@/app/_schemas/training";

import { TrainingForm } from "./training-form";
import { useToast } from "./use-toast";

import type { Exercise } from "@/app/_schemas/exercise";
import type { ComponentProps, FC } from "react";

type Props = {
  traineeId: string;
  training: Training;
  registeredExercises: Exercise[];
};
export const TrainingEditingForm: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();

  const submitTraining: ComponentProps<
    typeof TrainingForm
  >["submitTraining"] = async (fieldValues) => {
    const validateTrainingResult = validateTraining({
      id: props.training.id,
      date: new Date(fieldValues.date).toISOString(),
      records: fieldValues.records.flatMap((record, index) => {
        const exercise = props.registeredExercises.find(
          (exercise) => exercise.id === record.exerciseId
        );

        if (exercise === undefined) {
          return [];
        }

        return [
          {
            id: ulid(),
            exercise,
            sets: record.sets.map((set, index) => {
              return {
                id: ulid(),
                weight: Number(set.weight),
                repetition: Number(set.repetition),
                estimatedMaximumWeight: getEstimatedMaximumWeight({
                  weight: Number(set.weight),
                  repetition: Number(set.repetition),
                }),
                order: index + 1,
              };
            }),
            memo: record.memo,
            order: index + 1,
          },
        ];
      }),
    });
    if (validateTrainingResult.isErr) {
      renderToast({
        title: "トレーニングの更新に失敗しました",
        variant: "error",
      });
      return;
    }
    const training = validateTrainingResult.value;

    const result = await registerOrUpdateTraining({
      traineeId: props.traineeId,
      training,
    });

    router.refresh();
    renderToast(
      result.isOk
        ? {
            title: "トレーニングを更新しました",
            variant: "success",
          }
        : {
            title: "トレーニングの更新に失敗しました",
            variant: "error",
          }
    );
    router.push(`/trainees/${props.traineeId}/trainings/${props.training.id}`);
  };

  return (
    <TrainingForm
      submitButtonLabel="トレーニングを更新する"
      registeredExercises={props.registeredExercises}
      traineeId={props.traineeId}
      submitTraining={submitTraining}
      defaultValues={{
        date: format(new Date(props.training.date), "yyyy-MM-dd"),
        records: props.training.records.map((record) => {
          return {
            exerciseId: record.exercise.id,
            memo: record.memo,
            sets: record.sets.map((set) => {
              return {
                weight: set.weight.toString(),
                repetition: set.repetition.toString(),
              };
            }),
            copyWeight: false,
            copyReps: false,
          };
        }),
      }}
    />
  );
};
