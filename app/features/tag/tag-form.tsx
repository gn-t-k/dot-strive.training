import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Form } from "@remix-run/react";
import { parseWithValibot } from "conform-to-valibot";
import { check, nonOptional, object, optional, pipe, string } from "valibot";

import { Button } from "app/ui/button";
import { FormErrorMessage } from "app/ui/form-error-message";
import { Input } from "app/ui/input";
import { Label } from "app/ui/label";

import type { FC } from "react";

export const getTagFormSchema = ({
  registeredTags,
  beforeName,
}: { registeredTags: Tag[]; beforeName?: string | undefined }) =>
  object({
    id: optional(string()),
    name: nonOptional(
      pipe(
        string(),
        check(
          (value) =>
            registeredTags.every((tag) => tag.name !== value) ||
            value === beforeName,
          "タグの名前が重複しています",
        ),
      ),
      "タグの名前を入力してください",
    ),
    actionType: string(),
  });

type Props = {
  registeredTags: Tag[];
  actionType: string;
  defaultValues?: {
    id: string;
    name: string;
  };
};
type Tag = { id: string; name: string };
export const TagForm: FC<Props> = ({
  registeredTags,
  actionType,
  defaultValues,
}) => {
  const beforeName = defaultValues?.name;
  const [form, fields] = useForm({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) =>
      parseWithValibot(formData, {
        schema: getTagFormSchema({ registeredTags, beforeName }),
      }),
    defaultValue: defaultValues,
  });

  return (
    <Form method="post" className="flex space-x-1" {...getFormProps(form)}>
      <input {...getInputProps(fields.id, { type: "hidden" })} />
      <fieldset className="w-full grow">
        <VisuallyHidden>
          <Label htmlFor={fields.name.id}>名前</Label>
        </VisuallyHidden>
        <Input
          {...getInputProps(fields.name, { type: "text" })}
          placeholder="例: 大胸筋"
        />
        {fields.name.errors?.map((error) => (
          <FormErrorMessage key={error} message={error} />
        ))}
      </fieldset>
      <Button
        type="submit"
        name="actionType"
        value={actionType}
        className="grow-0"
      >
        登録
      </Button>
    </Form>
  );
};
