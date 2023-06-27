import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useForm } from "@/libs/react-hook-form/use-form";

import type { UseFormReturn } from "react-hook-form";

const exerciseFieldSchema = z.object({
  name: z.string().min(1, "種目名を入力してください"),
  targets: z.array(z.string().min(1)).min(1, "対象部位を選択してください"),
});
export type ExerciseField = z.infer<typeof exerciseFieldSchema>;

type UseExerciseForm = (
  defaultValue?: ExerciseField
) => UseFormReturn<ExerciseField>;
export const useExerciseForm: UseExerciseForm = (defaultValue) => {
  return useForm<ExerciseField>({
    resolver: zodResolver(exerciseFieldSchema),
    defaultValues: defaultValue ?? {
      name: "",
      targets: [],
    },
  });
};
