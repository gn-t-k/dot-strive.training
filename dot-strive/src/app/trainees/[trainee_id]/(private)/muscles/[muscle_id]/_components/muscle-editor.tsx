"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler } from "react-hook-form";

import { Button } from "@/app/_components/button";
import { Input } from "@/app/_components/input";
import { useToast } from "@/app/_hooks/use-toast";
import { getAllMusclesBySession } from "@/app/trainees/[trainee_id]/(private)/_accessor/get-all-muscles-by-session";
import { deleteMuscle } from "@/app/trainees/[trainee_id]/(private)/muscles/[muscle_id]/_accessor/delete-muscle";
import { updateMuscle } from "@/app/trainees/[trainee_id]/(private)/muscles/[muscle_id]/_accessor/update-muscle";
import { useMuscleForm } from "@/app/trainees/[trainee_id]/(private)/muscles/_hooks/use-muscle-form";
import { stack } from "styled-system/patterns";

import type { Muscle } from "@/app/_schemas/muscle";
import type { MuscleField } from "@/app/trainees/[trainee_id]/(private)/muscles/_hooks/use-muscle-form";
import type { FC, MouseEventHandler } from "react";

type Props = {
  traineeId: string;
  muscle: Muscle;
};
export const MuscleEditor: FC<Props> = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useMuscleForm({
    name: props.muscle.name,
  });
  const router = useRouter();
  const { Toast, renderToast } = useToast();

  const onClickEditButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsEditing(true);
  };
  const onClickCancelEditButton: MouseEventHandler<HTMLButtonElement> = (_) => {
    setIsEditing(false);
    reset();
  };
  const onClickSaveButton: SubmitHandler<MuscleField> = async (fieldValues) => {
    setIsEditLoading(true);
    const registeredMuscles = await getAllMusclesBySession({
      traineeId: props.traineeId,
    });
    if (registeredMuscles.isErr()) {
      setIsEditLoading(false);
      renderToast({ title: "部位の更新に失敗しました", variant: "error" });

      return;
    }

    if (
      registeredMuscles.value.some((muscle) => muscle.name === fieldValues.name)
    ) {
      setIsEditLoading(false);
      renderToast({
        title: `部位「${fieldValues.name}」はすでに登録されています`,
        variant: "error",
      });

      return;
    }

    const result = await updateMuscle({
      traineeId: props.traineeId,
      muscleId: props.muscle.id,
      muscleName: fieldValues.name,
    });
    setIsEditLoading(false);
    renderToast(
      result.isOk()
        ? {
            title: `部位「${props.muscle.name}」の名前を「${result.value.name}」に更新しました`,
            variant: "success",
          }
        : { title: "部位の更新に失敗しました", variant: "error" }
    );

    setIsEditing(false);
    router.refresh();
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

    renderToast(
      result.isOk()
        ? {
            title: `部位「${result.value.name}」を削除しました`,
            variant: "success",
          }
        : { title: "部位の削除に失敗しました", variant: "error" }
    );
    setIsConfirmingDelete(false);
    router.refresh();
    if (result.isOk()) {
      router.replace(`/trainees/${props.traineeId}/muscles`);
    }
  };

  return (
    <>
      {isEditing ? (
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
      )}
      <Toast />
    </>
  );
};
