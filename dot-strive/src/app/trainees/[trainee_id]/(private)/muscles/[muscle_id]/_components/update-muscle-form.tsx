"use client";

import { useState } from "react";
import { type SubmitHandler } from "react-hook-form";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { type Muscle } from "@/app/_schemas/muscle";
import { deleteMuscle } from "@/app/trainees/[trainee_id]/(private)/muscles/[muscle_id]/_repositories/delete-muscle";
import { updateMuscle } from "@/app/trainees/[trainee_id]/(private)/muscles/[muscle_id]/_repositories/update-muscle";
import { useMuscleForm } from "@/app/trainees/[trainee_id]/(private)/muscles/_hooks/use-muscle-form";
import { stack } from "styled-system/patterns";

import type { MuscleField } from "@/app/trainees/[trainee_id]/(private)/muscles/_hooks/use-muscle-form";
import type { Result } from "neverthrow";
import type { FC, MouseEventHandler } from "react";

type Props = {
  traineeId: string;
  muscle: Muscle;
  registeredMuscles: Muscle[];
  afterUpdate?: AfterUpdate;
  afterDelete?: AfterDelete;
};
export type AfterUpdate = (
  fieldValues: MuscleField,
  result: Result<Muscle, Error>
) => void;
export type AfterDelete = (result: Result<Muscle, Error>) => void;
export const UpdateMuscleForm: FC<Props> = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
    setError,
  } = useMuscleForm({
    name: props.muscle.name,
  });
  const onClickEditButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsEditing(true);
  };
  const onClickCancelEditButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsEditing(false);
    reset();
  };
  const onClickSaveButton: SubmitHandler<MuscleField> = async (fieldValues) => {
    setIsEditLoading(true);

    if (
      props.registeredMuscles.some((muscle) => muscle.name === fieldValues.name)
    ) {
      setIsEditLoading(false);
      setError("name", {
        type: "custom",
        message: `部位「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    const result = await updateMuscle({
      traineeId: props.traineeId,
      muscleId: props.muscle.id,
      muscleName: fieldValues.name,
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

    const result = await deleteMuscle({
      traineeId: props.traineeId,
      muscleId: props.muscle.id,
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
        <Input {...register("name")} aria-label="部位名" />
        {!!errors.name && <p>{errors.name.message}</p>}
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
        <Button disabled={true} visual="neutral">
          {props.muscle.name}を削除する
        </Button>
      </div>
    </form>
  ) : isConfirmingDelete ? (
    <div className={stack({ direction: "column" })}>
      <p>{props.muscle.name}</p>
      <Button disabled={true} visual="neutral">
        {props.muscle.name}を編集する
      </Button>
      <div className={stack({ direction: "row", justify: "end" })}>
        <Button
          onClick={onClickConfirmDeleteButton}
          disabled={isDeleteLoading}
          visual="negative"
        >
          {props.muscle.name}を削除する
        </Button>
        <Button
          onClick={onClickCancelDeleteButton}
          disabled={isDeleteLoading}
          visual="neutral"
        >
          削除しない
        </Button>
      </div>
    </div>
  ) : (
    <div className={stack({ direction: "column" })}>
      <p>{props.muscle.name}</p>
      <Button onClick={onClickEditButton} visual="neutral">
        {props.muscle.name}を編集する
      </Button>
      <Button onClick={onClickDeleteButton} visual="neutral">
        {props.muscle.name}を削除する
      </Button>
    </div>
  );
};
