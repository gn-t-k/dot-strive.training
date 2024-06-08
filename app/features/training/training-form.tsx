import {
  getFieldsetProps,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { Form, Link } from "@remix-run/react";
import { parseWithValibot } from "conform-to-valibot";
import { format } from "date-fns";
import { ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  array,
  check,
  maxLength,
  maxValue,
  minLength,
  minValue,
  nonOptional,
  number,
  object,
  optional,
  pipe,
  string,
} from "valibot";

import { Button } from "app/ui/button";
import { Card, CardContent, CardHeader } from "app/ui/card";
import { DatePicker } from "app/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "app/ui/dropdown-menu";
import { FormErrorMessage } from "app/ui/form-error-message";
import { Input } from "app/ui/input";
import { Label } from "app/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "app/ui/select";
import { Slider } from "app/ui/slider";
import { Textarea } from "app/ui/textarea";

import type { FieldMetadata, FormMetadata } from "@conform-to/react";
import { Popover, PopoverContent, PopoverTrigger } from "app/ui/popover";
import type { FC } from "react";
import type { InferInput } from "valibot";

export const getTrainingFormSchema = (registeredExercises: Exercise[]) =>
  object({
    id: optional(string()),
    date: nonOptional(
      pipe(
        string(),
        check((value) => !Number.isNaN(new Date(value).getTime())),
      ),
      "日付を選択してください",
    ),
    sessions: pipe(
      array(getSessionSchema(registeredExercises)),
      minLength(1, "セッションの情報を入力してください"),
    ),
  });
const getSessionSchema = (registeredExercises: Exercise[]) =>
  object({
    exerciseId: nonOptional(
      pipe(
        string(),
        check((value) =>
          registeredExercises.some((exercise) => exercise.id === value),
        ),
      ),
      "種目を選択してください",
    ),
    memo: optional(
      pipe(string(), maxLength(100, "メモは100文字以内で入力してください")),
      "",
    ),
    sets: pipe(
      array(setSchema),
      minLength(1, "セットの情報を入力してください"),
    ),
  });
const setSchema = object({
  weight: nonOptional(
    pipe(number(), minValue(0, "0以上の数値で入力してください")),
    "重量を入力してください",
  ),
  reps: nonOptional(
    pipe(number(), minValue(0, "0以上の数値で入力してください")),
    "回数を入力してください",
  ),
  rpe: optional(
    pipe(
      number(),
      minValue(0, "1以上の数値で入力してください"),
      maxValue(10, "10以下の数値で入力してください"),
    ),
    0,
  ),
});

type TrainingFormType = InferInput<ReturnType<typeof getTrainingFormSchema>>;
type SessionFieldsType = InferInput<ReturnType<typeof getSessionSchema>>;
type SetFieldsType = InferInput<typeof setSchema>;

type Props = {
  traineeId: string;
  registeredExercises: Exercise[];
  actionType: string;
  defaultValue: {
    id?: string;
    date: string;
    sessions: {
      exerciseId: string;
      memo: string;
      sets: {
        weight: string;
        reps: string;
        rpe: string;
      }[];
    }[];
  };
};
type Exercise = { id: string; name: string };
export const TrainingForm: FC<Props> = ({
  traineeId,
  registeredExercises,
  actionType,
  defaultValue,
}) => {
  const [form, fields] = useForm<TrainingFormType>({
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, {
        schema: getTrainingFormSchema(registeredExercises),
      });
    },
    defaultValue,
  });

  return (
    <Form method="post" className="flex flex-col gap-8" {...getFormProps(form)}>
      <input {...getInputProps(fields.id, { type: "hidden" })} />
      <DateField dateField={fields.date} />
      <SessionsFieldset
        removeIntent={form.remove}
        insertIntent={form.insert}
        sessionsField={fields.sessions}
        registeredExercises={registeredExercises}
        traineeId={traineeId}
      />
      <Button type="submit" name="actionType" value={actionType}>
        登録
      </Button>
    </Form>
  );
};

type DateFieldProps = {
  dateField: FieldMetadata<TrainingFormType["date"]>;
};
const DateField: FC<DateFieldProps> = ({ dateField }) => {
  const { value, change } = useInputControl({
    ...dateField,
    name: dateField.name,
    formId: dateField.formId,
    initialValue: dateField.initialValue,
  });

  // サーバーでのレンダリングとクライアントでのレンダリングの結果が異なることによるハイドレーションエラーを避けるため
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={dateField.id}>日付</Label>
      <DatePicker
        date={value && isClient ? new Date(value) : undefined}
        setDate={(date) =>
          change(date ? format(date, "yyyy-MM-dd") : undefined)
        }
      />
      {dateField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SessionsFieldsetProps = {
  removeIntent: FormMetadata<TrainingFormType>["remove"];
  insertIntent: FormMetadata<TrainingFormType>["insert"];
  sessionsField: FieldMetadata<TrainingFormType["sessions"]>;
  registeredExercises: Exercise[];
  traineeId: string;
};
const SessionsFieldset: FC<SessionsFieldsetProps> = ({
  removeIntent,
  insertIntent,
  sessionsField,
  registeredExercises,
  traineeId,
}) => {
  const sessions = sessionsField.getFieldList();

  return (
    <fieldset
      {...getFieldsetProps(sessionsField)}
      className="flex flex-col gap-4"
    >
      <ol className="flex flex-col gap-4">
        {sessions.map((session, sessionIndex) => (
          <li key={session.id}>
            <SessionFields
              removeIntent={removeIntent}
              insertIntent={insertIntent}
              sessionField={session}
              registeredExercises={registeredExercises}
              sessionIndex={sessionIndex}
              traineeId={traineeId}
            />
          </li>
        ))}
      </ol>
      {sessionsField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
      <Button
        {...insertIntent.getButtonProps({ name: "sessions" })}
        {...insertIntent.getButtonProps({
          name: `sessions[${sessions.length}].sets`,
        })}
        variant="secondary"
      >
        セッションを追加
      </Button>
    </fieldset>
  );
};

type SessionFieldsProps = {
  removeIntent: FormMetadata<TrainingFormType>["remove"];
  insertIntent: FormMetadata<TrainingFormType>["insert"];
  sessionField: FieldMetadata<SessionFieldsType>;
  registeredExercises: Exercise[];
  sessionIndex: number;
  traineeId: string;
};
const SessionFields: FC<SessionFieldsProps> = ({
  removeIntent,
  insertIntent,
  sessionField,
  registeredExercises,
  sessionIndex,
  traineeId,
}) => {
  const sessionFields = sessionField.getFieldset();
  const setFieldList = sessionFields.sets.getFieldList();

  return (
    <Card key={sessionField.id}>
      <CardHeader className="flex items-center justify-between">
        <Label asChild>
          <legend>セッション{sessionIndex + 1}</legend>
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <X className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Button
                  {...removeIntent.getButtonProps({
                    name: "sessions",
                    index: sessionIndex,
                  })}
                  variant="ghost"
                >
                  セッション{sessionIndex + 1}を削除する
                </Button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ExerciseField
          registeredExercises={registeredExercises}
          exerciseField={sessionFields.exerciseId}
          traineeId={traineeId}
        />
        <SetsFieldset
          setFieldList={setFieldList}
          setsField={sessionFields.sets}
          removeIntent={removeIntent}
          sessionIndex={sessionIndex}
        />
        <Button
          {...insertIntent.getButtonProps({
            name: `sessions[${sessionIndex}].sets`,
          })}
          variant="secondary"
        >
          セットを追加
        </Button>
        <MemoField memoField={sessionFields.memo} />
      </CardContent>
    </Card>
  );
};

type ExerciseFieldProps = {
  registeredExercises: Exercise[];
  exerciseField: FieldMetadata<SessionFieldsType["exerciseId"]>;
  traineeId: string;
};
const ExerciseField: FC<ExerciseFieldProps> = ({
  registeredExercises,
  exerciseField,
  traineeId,
}) => {
  const { value, change } = useInputControl(exerciseField);
  const selectValue = value ? { value } : {};
  const selectDefaultValue = exerciseField.initialValue
    ? { defaultValue: exerciseField.initialValue }
    : {};

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={exerciseField.id}>種目</Label>
      <div className="flex gap-2 items-center">
        <Select
          {...selectValue}
          {...selectDefaultValue}
          onValueChange={(value) => change(value)}
        >
          <SelectTrigger id={exerciseField.id}>
            <SelectValue placeholder="種目を選択する" />
          </SelectTrigger>
          <SelectContent
            // https://github.com/radix-ui/primitives/issues/1658
            ref={(ref) =>
              ref?.addEventListener("touchend", (event) =>
                event.preventDefault(),
              )
            }
          >
            {registeredExercises.map((exercise) => (
              <SelectItem
                key={`${exercise.id}-${exercise.id}`}
                value={exercise.id}
              >
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value ? (
          <Button size="icon" variant="outline" asChild>
            <Link
              to={`/trainees/${traineeId}/exercises/${value}`}
              target="_blank"
            >
              <ExternalLink className="size-4 text-primary" />
            </Link>
          </Button>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="outline">
                <ExternalLink className="size-4 text-muted-foreground/50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-sm text-muted-foreground">
                種目を選択してください
              </p>
            </PopoverContent>
          </Popover>
        )}
      </div>
      {exerciseField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type MemoFieldProps = {
  memoField: FieldMetadata<SessionFieldsType["memo"]>;
};
const MemoField: FC<MemoFieldProps> = ({ memoField }) => {
  const { key, ...props } = getTextareaProps(memoField);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={memoField.id}>メモ</Label>
      <Textarea key={key} {...props} />
      {memoField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SetsFieldsetProps = {
  setFieldList: FieldMetadata<SetFieldsType>[];
  setsField: FieldMetadata<SessionFieldsType["sets"]>;
  removeIntent: FormMetadata<TrainingFormType>["remove"];
  sessionIndex: number;
};
const SetsFieldset: FC<SetsFieldsetProps> = ({
  setFieldList,
  setsField,
  removeIntent,
  sessionIndex,
}) => {
  const weightHistories = setFieldList.map(
    (setField) => setField.value?.weight,
  );
  const repsHistories = setFieldList.map((setField) => setField.value?.reps);

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-4">
        {setFieldList.map((set, setIndex) => (
          <li key={set.id}>
            <SetFields
              removeIntent={removeIntent}
              setField={set}
              sessionIndex={sessionIndex}
              setIndex={setIndex}
              lastWeightValue={weightHistories[setIndex - 1]}
              lastRepsValue={repsHistories[setIndex - 1]}
            />
          </li>
        ))}
      </ol>
      {setsField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type SetFieldsProps = {
  removeIntent: FormMetadata<TrainingFormType>["remove"];
  setField: FieldMetadata<SetFieldsType>;
  sessionIndex: number;
  setIndex: number;
  lastWeightValue: string | undefined;
  lastRepsValue: string | undefined;
};
const SetFields: FC<SetFieldsProps> = ({
  removeIntent,
  setField,
  sessionIndex,
  setIndex,
  lastWeightValue,
  lastRepsValue,
}) => {
  const setFields = setField.getFieldset();

  return (
    <fieldset {...getFieldsetProps(setField)} className="flex flex-col gap-2">
      <header className="flex items-center justify-between">
        <Label asChild>
          <legend>セット{setIndex + 1}</legend>
        </Label>
        <Button
          {...removeIntent.getButtonProps({
            name: `sessions[${sessionIndex}].sets`,
            index: setIndex,
          })}
          size="icon"
          variant="ghost"
          className="col-span-1 justify-self-end"
        >
          <X className="size-4" />
        </Button>
      </header>
      <WeightField weightField={setFields.weight} lastValue={lastWeightValue} />
      <RepsField repsField={setFields.reps} lastValue={lastRepsValue} />
      <RPEField rpeField={setFields.rpe} />
    </fieldset>
  );
};

type WeightFieldProps = {
  weightField: FieldMetadata<SetFieldsType["weight"]>;
  lastValue: string | undefined;
};
const WeightField: FC<WeightFieldProps> = ({ weightField, lastValue }) => {
  const { value: value_, change } = useInputControl({
    ...weightField,
    initialValue: weightField.initialValue ?? lastValue,
    formId: weightField.formId,
  });
  const value = value_ ?? "";
  const decrease = useCallback(() => {
    if (value === undefined || Number.isNaN(Number(value))) {
      return;
    }
    const next = Number(value) - 2.5;
    if (next < 0) {
      return;
    }
    change(next.toString());
  }, [change, value]);
  const increase = useCallback(() => {
    if (value === undefined || Number.isNaN(Number(value))) {
      return;
    }
    change((Number(value) + 2.5).toString());
  }, [change, value]);

  const { key, ...props } = getInputProps(weightField, {
    type: "number",
    value: false,
  });

  return (
    <div className="flex flex-col gap-2 pl-2">
      <div className="grid grid-cols-5 items-center gap-2">
        <Label htmlFor={weightField.id} className="col-span-1">
          重量
        </Label>
        <div className="col-span-2 flex items-center gap-1">
          <Input
            key={key}
            {...props}
            value={value}
            onChange={(event) => change(event.target.value)}
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
          />
          <span>kg</span>
        </div>
        <div className="col-span-2 flex items-center justify-end gap-1">
          <Button
            onClick={decrease}
            size="icon"
            variant="outline"
            type="button"
          >
            -2.5
          </Button>
          <Button
            onClick={increase}
            size="icon"
            variant="outline"
            type="button"
          >
            +2.5
          </Button>
        </div>
      </div>
      {weightField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

type RepsFieldProps = {
  repsField: FieldMetadata<SetFieldsType["reps"]>;
  lastValue: string | undefined;
};
const RepsField: FC<RepsFieldProps> = ({ repsField, lastValue }) => {
  const { value: value_, change } = useInputControl({
    ...repsField,
    initialValue: repsField.initialValue ?? lastValue,
    formId: repsField.formId,
  });
  const value = value_ ?? "";
  const decrease = useCallback(() => {
    if (value === undefined || Number.isNaN(Number(value))) {
      return;
    }
    const next = Number(value) - 1;
    if (next < 0) {
      return;
    }
    change(next.toString());
  }, [change, value]);
  const increase = useCallback(() => {
    if (value === undefined || Number.isNaN(Number(value))) {
      return;
    }
    change((Number(value) + 1).toString());
  }, [change, value]);

  const { key, ...props } = getInputProps(repsField, {
    type: "number",
    value: false,
  });

  return (
    <div className="flex flex-col gap-2 pl-2">
      <div className="grid grid-cols-5 items-center gap-2">
        <Label htmlFor={repsField.id} className="col-span-1">
          回数
        </Label>
        <div className="col-span-2 flex items-center gap-1">
          <Input
            key={key}
            {...props}
            value={value}
            onChange={(event) => change(event.target.value)}
            pattern="[0-9]*"
            placeholder="000"
          />
          <span>回</span>
        </div>
        <div className="col-span-2 flex items-center justify-end gap-1">
          <Button
            onClick={decrease}
            size="icon"
            variant="outline"
            type="button"
          >
            -1
          </Button>
          <Button
            onClick={increase}
            size="icon"
            variant="outline"
            type="button"
          >
            +1
          </Button>
        </div>
      </div>
      {repsField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};

// biome-ignore lint/style/useNamingConvention: RPEはRPEなので
type RPEFieldProps = {
  rpeField: FieldMetadata<SetFieldsType["rpe"]>;
};
// biome-ignore lint/style/useNamingConvention: RPEはRPEなので
const RPEField: FC<RPEFieldProps> = ({ rpeField }) => {
  const { value, change } = useInputControl(rpeField);
  const defaultValue = Number(rpeField.initialValue);
  const onSliderChange = useCallback(
    (value: number[]) => {
      change(value[0]?.toString());
    },
    [change],
  );
  const onClearButtonClick = useCallback(() => {
    change("0");
  }, [change]);
  const sliderValue = value === undefined ? {} : { value: [Number(value)] };

  return (
    <div className="flex flex-col gap-2 pl-2">
      <div className="grid grid-cols-5 items-center gap-2">
        <Label className="col-span-1">RPE</Label>
        <Slider
          step={0.5}
          min={5}
          max={10}
          {...sliderValue}
          onValueChange={onSliderChange}
          defaultValue={Number.isNaN(defaultValue) ? [0] : [defaultValue]}
          className="col-span-2"
        />
        <div className="col-span-2 flex items-center justify-end gap-1">
          <span className="text-center content-center size-10">
            {[undefined, "0"].includes(value) ? "-" : value}
          </span>
          <Button
            onClick={onClearButtonClick}
            size="icon"
            variant="outline"
            type="button"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      {rpeField.errors?.map((error) => (
        <FormErrorMessage key={error} message={error} />
      ))}
    </div>
  );
};
