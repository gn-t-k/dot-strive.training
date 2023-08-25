"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { useForm } from "@/app/_libs/react-hook-form/use-form";
import { stack } from "styled-system/patterns";

import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

type Props = {
  submitMuscleLabel: string;
  registeredMuscles: Muscle[];
  submitMuscle: SubmitMuscle;
  defaultValues?: MuscleField;
};
export type SubmitMuscle = (fieldValues: MuscleField) => Promise<void>;
export const MuscleForm: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useMuscleForm(props.defaultValues);

  const onSubmit: SubmitHandler<MuscleField> = async (fieldValues) => {
    setIsLoading(true);

    const isSameNameMuscleExist = props.registeredMuscles.some(
      (muscle) => muscle.name === fieldValues.name
    );

    if (isSameNameMuscleExist) {
      setIsLoading(false);
      setError("name", {
        type: "muscleNameConflictError",
        message: `部位「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    await props.submitMuscle(fieldValues);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={stack({ direction: "column" })}>
        <div className={stack({ direction: "row" })}>
          <Input {...register("name")} aria-label="部位名" />
          <Button type="submit" disabled={isLoading} visual="positive">
            {props.submitMuscleLabel}
          </Button>
        </div>
        {!!errors.name && <p>{errors.name.message}</p>}
      </div>
    </form>
  );
};

const muscleFieldSchema = z.object({
  name: z.string().min(1, "部位名を入力してください"),
});
export type MuscleField = z.infer<typeof muscleFieldSchema>;

type UseMuscleForm = (
  defaultValues?: MuscleField
) => UseFormReturn<MuscleField>;
const useMuscleForm: UseMuscleForm = (defaultValues) => {
  return useForm<MuscleField>({
    resolver: zodResolver(muscleFieldSchema),
    defaultValues: defaultValues ?? {
      name: "",
    },
  });
};
