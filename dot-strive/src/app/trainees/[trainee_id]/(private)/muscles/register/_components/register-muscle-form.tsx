"use client";

import { useState, type FC } from "react";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { useMuscleForm } from "@/app/trainees/[trainee_id]/(private)/muscles/_hooks/use-muscle-form";
import { registerMuscle } from "@/app/trainees/[trainee_id]/(private)/muscles/_repositories/register-muscle";
import { stack } from "styled-system/patterns";

import type { Muscle } from "@/app/_schemas/muscle";
import type { MuscleField } from "@/app/trainees/[trainee_id]/(private)/muscles/_hooks/use-muscle-form";
import type { Result } from "neverthrow";
import type { SubmitHandler } from "react-hook-form";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
  afterRegister?: AfterRegister;
};
export type AfterRegister = (
  fieldValues: MuscleField,
  result: Result<Muscle, Error>
) => void;
export const RegisterMuscleForm: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useMuscleForm();

  const onSubmit: SubmitHandler<MuscleField> = async (fieldValues) => {
    setIsLoading(true);

    const isSameNameMuscleExist = props.registeredMuscles.some(
      (muscle) => muscle.name === fieldValues.name
    );

    if (isSameNameMuscleExist) {
      setIsLoading(false);
      setError("name", {
        type: "custom",
        message: `部位「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    const result = await registerMuscle({
      traineeId: props.traineeId,
      muscleName: fieldValues.name,
    });
    setIsLoading(false);

    if (props.afterRegister) {
      props.afterRegister(fieldValues, result);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={stack({ direction: "column" })}>
        <div className={stack({ direction: "row" })}>
          <Input {...register("name")} aria-label="部位名" />
          <Button type="submit" disabled={isLoading} visual="positive">
            部位を登録する
          </Button>
        </div>
        {!!errors.name && <p>{errors.name.message}</p>}
      </div>
    </form>
  );
};
