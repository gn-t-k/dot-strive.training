"use client";

import Link from "next/link";
import { useState } from "react";
import { type SubmitHandler } from "react-hook-form";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { type Exercise } from "@/app/_schemas/exercise";
import { useExerciseForm } from "@/app/trainees/[trainee_id]/(private)/exercises/[exercise_id]/_hooks/use-exercise-form";
import { deleteExercise } from "@/app/trainees/[trainee_id]/(private)/exercises/[exercise_id]/_repositories/delete-exercise";
import { updateExercise } from "@/app/trainees/[trainee_id]/(private)/exercises/[exercise_id]/_repositories/update-exercise";
import { stack } from "styled-system/patterns";

import type { Muscle } from "@/app/_schemas/muscle";
import type { ExerciseField } from "@/app/trainees/[trainee_id]/(private)/exercises/[exercise_id]/_hooks/use-exercise-form";
import type { Result } from "neverthrow";
import type { FC, MouseEventHandler } from "react";

type Props = {
  traineeId: string;
  exercise: Exercise;
  registeredMuscles: Muscle[];
  registeredExercises: Exercise[];
  afterUpdate?: AfterUpdate;
  afterDelete?: AfterDelete;
};
export type AfterUpdate = (
  fieldValues: ExerciseField,
  result: Result<Exercise, Error>
) => void;
export type AfterDelete = (result: Result<Exercise, Error>) => void;
export const UpdateExerciseForm: FC<Props> = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useExerciseForm({
    name: props.exercise.name,
    targets: props.exercise.targets.map((target) => target.id),
  });

  const onClickEditButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsEditing(true);
  };
  const onClickCancelEditButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsEditing(false);
    reset();
  };
  const onClickSaveButton: SubmitHandler<ExerciseField> = async (
    fieldValues
  ) => {
    setIsEditLoading(true);

    if (
      fieldValues.name !== props.exercise.name &&
      props.registeredExercises.some(
        (exercise) => exercise.name === fieldValues.name
      )
    ) {
      setIsEditLoading(false);
      setError("name", {
        type: "custom",
        message: `種目「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    const result = await updateExercise({
      traineeId: props.traineeId,
      exerciseId: props.exercise.id,
      exerciseName: fieldValues.name,
      targetIds: fieldValues.targets,
    });
    setIsEditLoading(false);
    setIsEditing(false);

    if (props.afterUpdate) {
      props.afterUpdate(fieldValues, result);
    }
  };

  const onClickDeleteButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsConfirmingDelete(true);
  };
  const onClickCancelDeleteButton: MouseEventHandler<HTMLButtonElement> = (
    _
  ) => {
    setIsConfirmingDelete(false);
  };
  const onClickConfirmDeleteButton: MouseEventHandler<
    HTMLButtonElement
  > = async (_) => {
    setIsDeleteLoading(true);
    const result = await deleteExercise({
      traineeId: props.traineeId,
      exerciseId: props.exercise.id,
    });

    setIsDeleteLoading(false);
    setIsConfirmingDelete(false);

    if (props.afterDelete) {
      props.afterDelete(result);
    }
  };

  return isEditing ? (
    <form onSubmit={handleSubmit(onClickSaveButton)}>
      <div className={stack({ direction: "column" })}>
        <Input {...register("name")} aria-label="種目名" />
        {!!errors.name && <p>{errors.name.message}</p>}
        <ul className={stack({ direction: "column" })}>
          {props.registeredMuscles.map((muscle) => {
            const defaultChecked = props.exercise.targets.some(
              (target) => target.id === muscle.id
            );

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
        <div className={stack({ direction: "row", justify: "end" })}>
          <Button type="submit" disabled={isEditLoading} visual="positive">
            変更を保存する
          </Button>
          <Button
            onClick={onClickCancelEditButton}
            disabled={isEditLoading}
            visual="neutral"
          >
            変更しない
          </Button>
        </div>
        <Button disabled>{props.exercise.name}を削除する</Button>
      </div>
    </form>
  ) : isConfirmingDelete ? (
    <section className={stack({ direction: "column" })}>
      <h2>{props.exercise.name}</h2>
      <ul>
        {props.exercise.targets.map((target) => {
          return (
            <li key={target.id}>
              <Link href={`/trainees/${props.traineeId}/muscles/${target.id}`}>
                {target.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <Button onClick={onClickEditButton} disabled>
        {props.exercise.name}を編集する
      </Button>
      <div className={stack({ direction: "row", justify: "end" })}>
        <Button
          onClick={onClickConfirmDeleteButton}
          disabled={isDeleteLoading}
          visual="negative"
        >
          {props.exercise.name}を削除する
        </Button>
        <Button
          onClick={onClickCancelDeleteButton}
          disabled={isDeleteLoading}
          visual="neutral"
        >
          削除しない
        </Button>
      </div>
    </section>
  ) : (
    <section className={stack({ direction: "column" })}>
      <h2>{props.exercise.name}</h2>
      <ul>
        {props.exercise.targets.map((target) => {
          return (
            <li key={target.id}>
              <Link href={`/trainees/${props.traineeId}/muscles/${target.id}`}>
                {target.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <Button onClick={onClickEditButton}>
        {props.exercise.name}を編集する
      </Button>
      <Button onClick={onClickDeleteButton}>
        {props.exercise.name}を削除する
      </Button>
    </section>
  );
};
