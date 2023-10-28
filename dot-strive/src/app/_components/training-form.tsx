"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { useState, type FC, type MouseEventHandler, Suspense } from "react";
import { useFieldArray } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { LocalDate } from "@/app/_components/local-date";
import { Select } from "@/app/_components/select";
import { TextArea } from "@/app/_components/text-area";
import { useForm } from "@/app/_libs/react-hook-form/use-form";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { getRecordsByExerciseId } from "../_actions/get-records-by-exercise-id";

import type { Exercise } from "@/app/_schemas/exercise";
import type { Record } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";

type Props = {
  submitButtonLabel: string;
  defaultValues?: TrainingField;
  registeredExercises: Exercise[];
  traineeId: string;
  submitTraining: SubmitTraining;
};
type SubmitTraining = (fieldValues: TrainingField) => Promise<void>;
export const TrainingForm: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
    watch,
  } = useTrainingForm(props.defaultValues);
  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "records",
  });

  const onSubmit: SubmitHandler<TrainingField> = async (fieldValues) => {
    setIsLoading(true);
    await props.submitTraining(fieldValues);
    setIsLoading(false);
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
      copyWeight: false,
      copyReps: false,
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

          return (
            <div
              className={stack({
                direction: "column",
                p: 4,
                gap: 12,
                border: "1px solid",
              })}
              key={record.id}
            >
              <RecordForm
                traineeId={props.traineeId}
                control={control}
                recordIndex={index}
                register={register}
                errors={errors}
                watch={watch}
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
      <Button type="submit" disabled={isLoading} visual="positive">
        {props.submitButtonLabel}
      </Button>
    </form>
  );
};

type RecordFormProps = {
  traineeId: string;
  recordIndex: number;
  registeredExercises: Exercise[];
  control: UseFormReturn<TrainingField>["control"];
  register: UseFormReturn<TrainingField>["register"];
  errors: UseFormReturn<TrainingField>["formState"]["errors"];
  watch: UseFormReturn<TrainingField>["watch"];
};
const RecordForm: FC<RecordFormProps> = (props) => {
  const { fields, append, remove } = useFieldArray({
    control: props.control,
    name: `records.${props.recordIndex}.sets`,
  });

  const selectedExerciseId = props.watch(
    `records.${props.recordIndex}.exerciseId`
  );
  const selectedExercise = props.registeredExercises.find(
    (exercise) => exercise.id === selectedExerciseId
  );
  const previousWeight = props.watch(
    `records.${props.recordIndex}.sets.${fields.length - 1}.weight`
  );
  const previousReps = props.watch(
    `records.${props.recordIndex}.sets.${fields.length - 1}.repetition`
  );
  const copyWeight = props.watch(`records.${props.recordIndex}.copyWeight`);
  const copyReps = props.watch(`records.${props.recordIndex}.copyReps`);

  const onClickAddSet: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    append({
      weight: copyWeight ? previousWeight : "",
      repetition: copyReps ? previousReps : "",
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
        <div className={stack({ direction: "row", justify: "space-between" })}>
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
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                aria-label={`${selectedExercise?.name}の情報を見る`}
                disabled={!selectedExercise}
              >
                ℹ
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content>
                <div
                  className={css({
                    w: "300px",
                    maxH: "300px",
                    bg: "white",
                    border: "1px solid",
                    overflow: "auto",
                  })}
                >
                  <Suspense fallback={<p>データを取得しています</p>}>
                    <ExerciseInformation
                      traineeId={props.traineeId}
                      exerciseId={selectedExerciseId}
                    />
                  </Suspense>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
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
              <Button
                aria-label={`${index + 1}番目のセットを削除する`}
                onClick={onClickRemoveSet}
                disabled={fields.length < 2}
              >
                🗑
              </Button>
            </div>
          );
        })}
        <div className={stack({ direction: "column", gap: 2 })}>
          <div className={stack({ direction: "row" })}>
            <div className={stack({ direction: "row" })}>
              <input
                type="checkbox"
                id={`copy-weight-${props.recordIndex}`}
                {...props.register(`records.${props.recordIndex}.copyWeight`)}
              />
              <label htmlFor={`copy-weight-${props.recordIndex}`}>
                同じ重量
              </label>
            </div>
            <div className={stack({ direction: "row" })}>
              <input
                type="checkbox"
                id={`copy-reps-${props.recordIndex}`}
                {...props.register(`records.${props.recordIndex}.copyReps`)}
              />
              <label htmlFor={`copy-reps-${props.recordIndex}`}>同じ回数</label>
            </div>
          </div>
          <Button onClick={onClickAddSet}>セットを追加</Button>
        </div>
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
        copyWeight: z.boolean().default(false),
        copyReps: z.boolean().default(false),
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
          copyWeight: false,
          copyReps: false,
        },
      ],
    },
  });
};

type ExerciseInformationProps = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseInformation: FC<ExerciseInformationProps> = (props) => {
  const { data } = useSWR<
    {
      date: UTCDateString;
      records: Record[];
    }[]
  >(
    `get-records-by-exercise-id?traineeId=${props.traineeId}&exerciseId=${props.exerciseId}`,
    async () => {
      const result = await getRecordsByExerciseId({
        traineeId: props.traineeId,
        exerciseId: props.exerciseId,
        take: 10,
      });
      if (result.isErr) {
        throw result.error;
      }
      return result.value;
    },
    {
      suspense: true,
    }
  );

  return (
    <ul
      className={stack({
        direction: "column",
      })}
    >
      {data?.map((training) => {
        return (
          <li
            className={stack({ direction: "column", p: 4 })}
            key={training.date}
          >
            <LocalDate utcDateString={training.date} />
            <ul>
              {training.records.map((record) => {
                return (
                  <li
                    key={record.id}
                    className={stack({ direction: "column" })}
                  >
                    <ul
                      className={stack({
                        direction: "column",
                        px: 4,
                      })}
                    >
                      {record.sets.map((set) => {
                        return (
                          <li
                            key={set.id}
                            className={stack({ direction: "row" })}
                          >
                            <p>{set.weight}kg</p>
                            <p>{set.repetition}回</p>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
};
