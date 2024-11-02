import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { Button } from "app/ui/button";
import { Input } from "app/ui/input";
import { parseWithValibot } from "conform-to-valibot";
import type { FC, FormHTMLAttributes } from "react";
import { minValue, nonOptional, number, object, pipe } from "valibot";
import type { InferInput } from "valibot";

const maximumRepetitionFormSchema = object({
  weight: nonOptional(
    pipe(number(), minValue(0, "0以上の数値で入力してください")),
    "回数を入力してください",
  ),
});

type Props = {
  exerciseId: string;
  form: FC<FormHTMLAttributes<HTMLFormElement>>;
};
export const SearchTrainingsForm: FC<Props> = ({ form: Form }) => {
  const [form, fields] = useForm<
    InferInput<typeof maximumRepetitionFormSchema>
  >({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, {
        schema: maximumRepetitionFormSchema,
      });
    },
  });

  return (
    <Form {...getFormProps(form)} className="flex gap-2 items-center">
      <Input
        {...getInputProps(fields.weight, { type: "number", value: false })}
        inputMode="decimal"
        step="0.01"
        placeholder="0.00"
        className="flex-grow"
      />
      <span className="flex-none">kg</span>
      <Button type="submit" className="flex-none">
        検索
      </Button>
    </Form>
  );
};
