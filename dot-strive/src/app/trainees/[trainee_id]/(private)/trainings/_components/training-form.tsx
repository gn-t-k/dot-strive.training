"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { Select } from "@/app/_components/select";
import { TextArea } from "@/app/_components/text-area";
import { useForm } from "@/app/_libs/react-hook-form/use-form";
import { css, cx } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { registerTraining } from "../register/_repositories/register-training";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Training } from "@/app/_schemas/training";
import type { Result } from "neverthrow";
import type { FC, MouseEventHandler } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

type Props = {
  submitButtonLabel: string;
  defaultValues?: TrainingField;
  registeredExercises: Exercise[];
  traineeId: string;
  afterSubmit?: AfterSubmit;
};
type AfterSubmit = (
  fieldValues: TrainingField,
  result: Result<Training, Error>
) => void;
export const TrainingForm: FC<Props> = (props) => {
  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
  } = useTrainingForm(props.defaultValues);
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "records",
  });

  const onSubmit: SubmitHandler<TrainingField> = async (fieldValues) => {
    const registerTrainingResult = await registerTraining({
      traineeId: props.traineeId,
      date: fieldValues.date,
      records: fieldValues.records.map((record) => {
        return {
          exerciseId: record.exerciseId,
          sets: record.sets.map((set) => {
            return {
              weight: Number(set.weight),
              repetition: Number(set.repetition),
            };
          }),
          memo: record.memo,
        };
      }),
    });

    if (props.afterSubmit) {
      props.afterSubmit(fieldValues, registerTrainingResult);
    }
  };
  const onClickAddExercise: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    append({
      exerciseId: "",
      sets: [
        {
          weight: "",
          repetition: "",
        },
      ],
      memo: "",
    });
  };
  const onClickRemoveRecordHOF =
    (recordIndex: number): MouseEventHandler<HTMLButtonElement> =>
    (event) => {
      event.preventDefault();

      remove(recordIndex);
    };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={stack({ direction: "column", gap: 12 })}
    >
      <div className={stack({ direction: "column" })}>
        <label htmlFor="date">日付</label>
        <Input type="date" id="date" {...register("date")} />
        {errors.date && (
          <p className={css({ color: "red" })}>{errors.date.message}</p>
        )}
      </div>
      <div className={stack({ direction: "column" })}>
        <p>記録</p>
        {fields.map((record, index) => {
          const onClickRemoveRecord = onClickRemoveRecordHOF(index);
          const styles = css({
            border: "1px solid",
          });

          return (
            <div
              className={cx(
                stack({ direction: "column", p: 4, gap: 12 }),
                styles
              )}
              key={record.id}
            >
              <RecordForm
                control={control}
                recordIndex={index}
                register={register}
                errors={errors}
                registeredExercises={props.registeredExercises}
              />
              <Button
                onClick={onClickRemoveRecord}
                disabled={fields.length < 2}
              >
                記録を削除
              </Button>
            </div>
          );
        })}
        <Button onClick={onClickAddExercise}>記録を追加</Button>
        {errors.records && (
          <p className={css({ color: "red" })}>{errors.records.message}</p>
        )}
      </div>
      <Button type="submit" visual="positive">
        {props.submitButtonLabel}
      </Button>
    </form>
  );
};

type RecordFormProps = {
  recordIndex: number;
  registeredExercises: Exercise[];
  control: UseFormReturn<TrainingField>["control"];
  register: UseFormReturn<TrainingField>["register"];
  errors: UseFormReturn<TrainingField>["formState"]["errors"];
};
const RecordForm: FC<RecordFormProps> = (props) => {
  const { fields, append, remove } = useFieldArray({
    control: props.control,
    name: `records.${props.recordIndex}.sets`,
  });

  const onClickAddSet: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    append({
      weight: "",
      repetition: "",
    });
  };
  const onClickRemoveSetHOF =
    (setIndex: number): MouseEventHandler<HTMLButtonElement> =>
    (event) => {
      event.preventDefault();

      remove(setIndex);
    };

  return (
    <div className={stack({ direction: "column", gap: 8 })}>
      <div className={stack({ direction: "column" })}>
        <label htmlFor={`records.${props.recordIndex}.exerciseId`}>種目</label>
        <Select
          id={`records.${props.recordIndex}.exerciseId`}
          {...props.register(`records.${props.recordIndex}.exerciseId`)}
        >
          {props.registeredExercises.map((exercise) => {
            return (
              <option value={exercise.id} key={exercise.id}>
                {exercise.name}
              </option>
            );
          })}
        </Select>
        {props.errors?.records?.[props.recordIndex]?.exerciseId && (
          <p className={css({ color: "red" })}>
            {props.errors.records[props.recordIndex]?.exerciseId?.message}
          </p>
        )}
      </div>
      <div className={stack({ direction: "column", gap: 4 })}>
        {fields.map((set, index) => {
          const onClickRemoveSet = onClickRemoveSetHOF(index);

          return (
            <div className={stack({ direction: "row" })} key={set.id}>
              <SetForm
                setIndex={index}
                recordIndex={props.recordIndex}
                errors={props.errors}
                register={props.register}
              />
              <Button onClick={onClickRemoveSet} disabled={fields.length < 2}>
                セットを削除
              </Button>
            </div>
          );
        })}
        <Button onClick={onClickAddSet}>セットを追加</Button>
        {props.errors?.records?.[props.recordIndex]?.sets && (
          <p className={css({ color: "red" })}>
            {props.errors.records[props.recordIndex]?.sets?.message}
          </p>
        )}
      </div>
      <div className={stack({ direction: "column" })}>
        <label htmlFor={`records.${props.recordIndex}.memo`}>メモ</label>
        <TextArea
          id={`records.${props.recordIndex}.memo`}
          {...props.register(`records.${props.recordIndex}.memo`)}
        />
        {props.errors?.records?.[props.recordIndex]?.memo && (
          <p className={css({ color: "red" })}>
            {props.errors.records[props.recordIndex]?.memo?.message}
          </p>
        )}
      </div>
    </div>
  );
};

type SetFormProps = {
  setIndex: number;
  recordIndex: number;
  errors: UseFormReturn<TrainingField>["formState"]["errors"];
  register: UseFormReturn<TrainingField>["register"];
};
const SetForm: FC<SetFormProps> = (props) => {
  return (
    <div className={stack({ direction: "column" })}>
      <p>{props.setIndex + 1}セット目</p>
      <div className={stack({ direction: "row" })}>
        <div className={stack({ direction: "column" })}>
          <div className={stack({ direction: "row" })}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              {...props.register(
                `records.${props.recordIndex}.sets.${props.setIndex}.weight`
              )}
            />
            <p>kg</p>
          </div>
          {props.errors?.records?.[props.recordIndex]?.sets?.[props.setIndex]
            ?.weight && (
            <p className={css({ color: "red" })}>
              {
                props.errors.records[props.recordIndex]?.sets?.[props.setIndex]
                  ?.weight?.message
              }
            </p>
          )}
        </div>
        <div className={stack({ direction: "column" })}>
          <div className={stack({ direction: "row" })}>
            <Input
              type="number"
              pattern="[0-9]*"
              placeholder="000"
              {...props.register(
                `records.${props.recordIndex}.sets.${props.setIndex}.repetition`
              )}
            />
            <p>回</p>
          </div>
          {props.errors?.records?.[props.recordIndex]?.sets?.[props.setIndex]
            ?.repetition && (
            <p className={css({ color: "red" })}>
              {
                props.errors.records[props.recordIndex]?.sets?.[props.setIndex]
                  ?.repetition?.message
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const trainingFieldSchema = z.object({
  date: z.string().min(1, "日付を入力してください"),
  records: z
    .array(
      z.object({
        exerciseId: z.string().min(1, "種目を選択してください"),
        memo: z.string().default(""),
        sets: z
          .array(
            z.object({
              weight: z
                .string()
                .min(1, "重量を入力してください")
                .regex(/^([1-9]\d*|0)(\.\d+)?$/, "数字で入力してください"),
              repetition: z
                .string()
                .min(1, "回数を入力してください")
                .regex(/^[0-9]+$/, "数字で入力してください"),
            })
          )
          .min(1, "重量・回数を入力してください"),
      })
    )
    .min(1, "記録を入力してください"),
});
export type TrainingField = z.infer<typeof trainingFieldSchema>;

type UseTrainingForm = (
  defaultValues?: TrainingField
) => UseFormReturn<TrainingField>;
const useTrainingForm: UseTrainingForm = (defaultValues) => {
  return useForm<TrainingField>({
    resolver: zodResolver(trainingFieldSchema),
    defaultValues: defaultValues ?? {
      date: format(new Date(), "yyyy-MM-dd"),
      records: [
        {
          exerciseId: "",
          sets: [
            {
              weight: "",
              repetition: "",
            },
          ],
          memo: "",
        },
      ],
    },
  });
};
