import {
  type FieldMetadata,
  getInputProps,
  useInputControl,
} from "@conform-to/react";
import { Button } from "app/ui/button";
import { FormErrorMessage } from "app/ui/form-error-message";
import { Input } from "app/ui/input";
import { Label } from "app/ui/label";
import { isValidNumberString } from "app/utils/is-valid-number-string";
import { type FC, type MouseEventHandler, useCallback } from "react";
import { type InferInput, minValue, nonOptional, number, pipe } from "valibot";

export const repetitionFieldSchema = nonOptional(
  pipe(number(), minValue(0, "0以上の数値で入力してください")),
  "回数を入力してください",
);

type Props = {
  fieldMetadata: FieldMetadata<InferInput<typeof repetitionFieldSchema>>;
  initialValue?: string | undefined;
};
export const RepetitionField: FC<Props> = ({ fieldMetadata, initialValue }) => {
  const { value, change } = useInputControl({
    ...fieldMetadata,
    initialValue: fieldMetadata.initialValue ?? initialValue,
    formId: fieldMetadata.formId,
  });
  const { key, ...inputProps } = getInputProps(fieldMetadata, {
    type: "number",
    value: false,
  });
  const adjustWeight = useCallback<
    (value: number) => MouseEventHandler<HTMLButtonElement>
  >(
    (value) => (_) => {
      change((previous) => {
        const next =
          previous !== undefined && isValidNumberString(previous)
            ? Number(previous) + value
            : value;
        return Math.max(0, next).toString();
      });
    },
    [change],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-5 items-center gap-2">
        <Label htmlFor={fieldMetadata.id} className="col-span-1">
          回数
        </Label>
        <div className="col-span-2 flex items-center gap-1">
          <Input
            key={key}
            {...inputProps}
            value={value ?? ""}
            onChange={(event) => change(event.target.value)}
            pattern="[0-9]*"
            placeholder="000"
          />
          <span>回</span>
        </div>
        <div className="col-span-2 flex items-center justify-end gap-1">
          <Button
            onClick={adjustWeight(-1)}
            size="icon"
            variant="outline"
            type="button"
          >
            -1
          </Button>
          <Button
            onClick={adjustWeight(1)}
            size="icon"
            variant="outline"
            type="button"
          >
            +1
          </Button>
        </div>
      </div>
      {fieldMetadata.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};
