import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FC } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { stack } from "styled-system/patterns";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Muscle } from "@/app/_schemas/muscle";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

type Props = {
  submitButtonLabel: string;
  defaultValues?: ExerciseField;
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
  submitExercise: SubmitExercise;
};
export type SubmitExercise = (fieldValues: ExerciseField) => Promise<void>;
export const ExerciseForm: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useExerciseForm(props.defaultValues);
  const onSubmit: SubmitHandler<ExerciseField> = async (fieldValues) => {
    setIsLoading(true);

    if (
      (!props.defaultValues || props.defaultValues.name !== fieldValues.name) &&
      props.registeredExercises.some(
        (exercise) => exercise.name === fieldValues.name
      )
    ) {
      setIsLoading(false);
      setError("name", {
        type: "exerciseNameConflictError",
        message: `種目「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    await props.submitExercise(fieldValues);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={stack({ direction: "column" })}>
        <Input {...register("name")} aria-label="種目名" />
        {!!errors.name && <p>{errors.name.message}</p>}
        <ul className={stack({ direction: "column" })}>
          {props.registeredMuscles.map((muscle) => {
            const defaultChecked = props.defaultValues
              ? props.defaultValues.targets.some(
                  (targetId) => targetId === muscle.id
                )
              : false;

            return (
              <li key={muscle.id}>
                <input
                  {...register("targets")}
                  type="checkbox"
                  value={muscle.id}
                  defaultChecked={defaultChecked}
                  id={muscle.id}
                />
                <label htmlFor={muscle.id}>{muscle.name}</label>
              </li>
            );
          })}
        </ul>
        {!!errors.targets && <p>{errors.targets.message}</p>}
        <Button type="submit" disabled={isLoading} visual="positive">
          {props.submitButtonLabel}
        </Button>
      </div>
    </form>
  );
};

const exerciseFieldSchema = z.object({
  name: z.string().min(1, "種目名を入力してください"),
  targets: z.array(z.string().min(1)).min(1, "対象部位を選択してください"),
});
export type ExerciseField = z.infer<typeof exerciseFieldSchema>;

type UseExerciseForm = (
  defaultValue?: ExerciseField
) => UseFormReturn<ExerciseField>;
const useExerciseForm: UseExerciseForm = (defaultValue) => {
  return useForm<ExerciseField>({
    resolver: zodResolver(exerciseFieldSchema),
    defaultValues: defaultValue ?? {
      name: "",
      targets: [],
    },
  });
};
