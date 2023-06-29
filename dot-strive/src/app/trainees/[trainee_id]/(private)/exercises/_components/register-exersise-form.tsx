"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { useToast } from "@/app/_hooks/use-toast";
import { stack } from "styled-system/patterns";

import { useExerciseForm } from "../[exercise_id]/_hooks/use-exercise-form";
import { registerExercise } from "../_repositories/register-exercise";

import type { ExerciseField } from "../[exercise_id]/_hooks/use-exercise-form";
import type { Exercise } from "@/app/_schemas/exercise";
import type { Muscle } from "@/app/_schemas/muscle";
import type { SubmitHandler } from "react-hook-form";

type Props = {
  traineeId: string;
  registeredExercises: Exercise[];
  registeredMuscles: Muscle[];
};
export const RegisterExerciseForm: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useExerciseForm();
  const router = useRouter();
  const { Toast, renderToast } = useToast();

  const onSubmit: SubmitHandler<ExerciseField> = async (fieldValues) => {
    setIsLoading(true);

    if (
      props.registeredExercises.some(
        (exercise) => exercise.name === fieldValues.name
      )
    ) {
      setIsLoading(false);
      setError("name", {
        type: "custom",
        message: `種目「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    const result = await registerExercise({
      traineeId: props.traineeId,
      exerciseName: fieldValues.name,
      targetIds: fieldValues.targets,
    });
    setIsLoading(false);

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

    if (result.isOk()) {
      router.refresh();
      router.push(`/trainees/${props.traineeId}/exercises`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={stack({ direction: "column" })}>
          <label htmlFor="muscle-name">種目名</label>
          <Input {...register("name")} id="muscle-name" />
          {!!errors.name && <p>{errors.name.message}</p>}
          <ul className={stack({ direction: "column" })}>
            {props.registeredMuscles.map((muscle) => (
              <li key={muscle.id}>
                <input
                  {...register("targets")}
                  type="checkbox"
                  value={muscle.id}
                  id={muscle.id}
                />
                <label htmlFor={muscle.id}>{muscle.name}</label>
              </li>
            ))}
          </ul>
          {!!errors.targets && <p>{errors.targets.message}</p>}
          <Button type="submit" visual="positive" disabled={isLoading}>
            種目を登録する
          </Button>
        </div>
      </form>
      <Toast />
    </>
  );
};
