import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useForm } from "@/libs/react-hook-form/use-form";

import type { UseFormReturn } from "react-hook-form";

const muscleFieldSchema = z.object({
  name: z.string().min(1, "部位名を入力してください"),
});
export type MuscleField = z.infer<typeof muscleFieldSchema>;

type UseMuscleForm = (
  defaultValues?: MuscleField
) => UseFormReturn<MuscleField>;
export const useMuscleForm: UseMuscleForm = (defaultValues) => {
  return useForm<MuscleField>({
    resolver: zodResolver(muscleFieldSchema),
    defaultValues: defaultValues ?? {
      name: "",
    },
  });
};
