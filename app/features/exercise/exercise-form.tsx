import {
  getCollectionProps,
  getFieldsetProps,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { Form } from "@remix-run/react";
import { parseWithValibot } from "conform-to-valibot";
import {
  array,
  check,
  minLength,
  nonOptional,
  object,
  optional,
  pipe,
  string,
} from "valibot";

import { Button } from "app/ui/button";
import { Checkbox } from "app/ui/checkbox";
import { FormErrorMessage } from "app/ui/form-error-message";
import { Input } from "app/ui/input";
import { Label } from "app/ui/label";

import type { FC } from "react";

export const getExerciseFormSchema = ({
  registeredTags,
  registeredExercises,
  beforeName,
}: {
  registeredTags: Tag[];
  registeredExercises: Exercise[];
  beforeName: string | null;
}) =>
  object({
    id: optional(string()),
    name: nonOptional(
      pipe(
        string(),
        check(
          (value) =>
            registeredExercises.every((exercise) => exercise.name !== value) ||
            value === beforeName,
          "種目の名前が重複しています",
        ),
      ),
      "種目の名前を入力してください",
    ),
    tags: pipe(
      array(
        pipe(
          string(),
          minLength(1),
          check((value) => registeredTags.some((tag) => tag.id === value)),
        ),
      ),
      minLength(1, "種目に紐付けるタグを選択してください"),
    ),
    actionType: string(),
  });
type Exercise = { id: string; name: string };
type Tag = { id: string; name: string };

type Props = {
  registeredTags: Tag[];
  registeredExercises: Exercise[];
  actionType: string;
  defaultValues?: {
    id: string;
    name: string;
    tags: string[];
  };
};
export const ExerciseForm: FC<Props> = ({
  registeredTags,
  registeredExercises,
  actionType,
  defaultValues,
}) => {
  const beforeName = defaultValues?.name ?? null;
  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, {
        schema: getExerciseFormSchema({
          registeredTags,
          registeredExercises,
          beforeName,
        }),
      });
    },
    defaultValue: defaultValues,
  });

  const { key: idKey, ...idProps } = getInputProps(fields.id, {
    type: "hidden",
  });
  const { key: nameKey, ...nameProps } = getInputProps(fields.name, {
    type: "text",
  });

  return (
    <Form
      method="post"
      className="flex flex-col space-y-3"
      {...getFormProps(form)}
    >
      <input key={idKey} {...idProps} />
      <div className="space-y-2">
        <Label htmlFor={fields.name.id}>名前</Label>
        <Input key={nameKey} {...nameProps} />
        {fields.name.errors?.map((error) => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </div>
      <fieldset {...getFieldsetProps(fields.tags)} className="space-y-2">
        <Label asChild>
          <legend>タグ</legend>
        </Label>
        {getCollectionProps(fields.tags, {
          type: "checkbox",
          options: registeredTags.map((tag) => tag.id),
        }).map(({ key, ...props }) => {
          return (
            <div key={props.id} className="flex items-center space-x-1">
              <Checkbox key={key} {...props} type="button" />
              <Label htmlFor={props.id} className="font-medium">
                {registeredTags.find((tag) => tag.id === props.value)?.name}
              </Label>
            </div>
          );
        })}
        {fields.tags.errors?.map((error) => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </fieldset>
      <Button type="submit" name="actionType" value={actionType}>
        登録
      </Button>
    </Form>
  );
};
