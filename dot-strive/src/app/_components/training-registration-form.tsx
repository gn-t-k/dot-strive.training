"use client";

import { format, setDate, setMonth, setYear } from "date-fns";
import { useRouter } from "next/navigation";
import { ulid } from "ulid";

import { registerOrUpdateTraining } from "@/app/_actions/register-or-update-training";
import { TrainingForm } from "@/app/_components/training-form";
import {
  getEstimatedMaximumWeight,
  validateTraining,
} from "@/app/_schemas/training";

import { useToast } from "./use-toast";

import type { TrainingField } from "@/app/_components/training-form";
import type { Exercise } from "@/app/_schemas/exercise";
import type { ComponentProps, FC } from "react";

type Props = {
  traineeId: string;
  trainingDate: number;
  registeredExercises: Exercise[];
};
export const TrainingRegistrationForm: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();

  const submitTraining: ComponentProps<
    typeof TrainingForm
  >["submitTraining"] = async (fieldValues) => {
    const inputDate = new Date(fieldValues.date);
    const [year, month, date] = [
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate(),
    ];
    const localDate = new Date();
    const combinedDate = setDate(
      setMonth(setYear(localDate, year), month),
      date
    );
    const validateTrainingResult = validateTraining({
      id: ulid(),
      date: new Date(combinedDate).toISOString(),
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
            sets: record.sets.map((set, index) => ({
              id: ulid(),
              weight: Number(set.weight),
              repetition: Number(set.repetition),
              estimatedMaximumWeight: getEstimatedMaximumWeight({
                weight: Number(set.weight),
                repetition: Number(set.repetition),
              }),
              order: index + 1,
            })),
            memo: record.memo,
            order: index + 1,
          },
        ];
      }),
    });
    if (validateTrainingResult.isErr) {
      renderToast({
        title: "トレーニングの登録に失敗しました",
        variant: "error",
      });

      return;
    }
    const training = validateTrainingResult.value;

    const result = await registerOrUpdateTraining({
      traineeId: props.traineeId,
      training,
    });

    renderToast(
      result.isOk
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
  const trainingDate = new Date(props.trainingDate).getTime();
  const defaultValues = !isNaN(trainingDate)
    ? ({
        date: format(trainingDate, "yyyy-MM-dd"),
        records: [
          {
            exerciseId: "",
            sets: [
              {
                weight: "",
                repetition: "",
              },
            ],
            memo: "",
            copyWeight: false,
            copyReps: false,
          },
        ],
      } satisfies TrainingField)
    : undefined;

  return (
    <TrainingForm
      submitButtonLabel="トレーニングを登録する"
      registeredExercises={props.registeredExercises}
      traineeId={props.traineeId}
      submitTraining={submitTraining}
      defaultValues={defaultValues}
    />
  );
};
