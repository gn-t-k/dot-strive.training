"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/app/_components/use-toast";
import { getFetcher } from "@/features/http-client/fetcher";
import { getMutator } from "@/features/http-client/mutator";
import { deleteMuscle } from "@/features/muscle/delete";
import { getAllMusclesBySession } from "@/features/muscle/get-all-by-session";
import { updateMuscle } from "@/features/muscle/update";
import { useMuscleForm } from "@/features/muscle/use-muscle-form";
import { stack } from "styled-system/patterns";

import type { Muscle } from "@/features/muscle";
import type { MuscleField } from "@/features/muscle/use-muscle-form";
import type { FC, MouseEventHandler } from "react";
import type { SubmitHandler } from "react-hook-form";

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
      fetcher: getFetcher(),
    })({
      traineeId: props.traineeId,
    });
    if (registeredMuscles.isErr()) {
      setIsEditLoading(false);
      renderToast({ title: "部位の更新に失敗しました", variant: "error" });
      // toast({
      //   title: "部位の更新に失敗しました",
      //   status: "error",
      //   isClosable: true,
      // });
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
      // toast({
      //   title: `部位「${fieldValues.name}」はすでに登録されています`,
      //   status: "error",
      //   isClosable: true,
      // });
      return;
    }

    const result = await updateMuscle({
      mutator: getMutator({
        method: "PATCH",
      }),
    })({
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
    // toast(
    //   result.isOk()
    //     ? {
    //         title: `部位「${props.muscle.name}」の名前を「${result.value.name}」に更新しました`,
    //         status: "success",
    //         isClosable: true,
    //       }
    //     : {
    //         title: "部位の更新に失敗しました",
    //         status: "error",
    //         isClosable: true,
    //       }
    // );

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
      mutator: getMutator({
        method: "DELETE",
      }),
    })({
      traineeId: props.traineeId,
      muscleId: props.muscle.id,
    });
    setIsDeleteLoading(false);

    // toast(
    //   result.isOk()
    //     ? {
    //         title: `部位「${result.value.name}」を削除しました`,
    //         status: "success",
    //         isClosable: true,
    //       }
    //     : {
    //         title: "部位の削除に失敗しました",
    //         status: "error",
    //         isClosable: true,
    //       }
    // );
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
            <input {...register("name")} aria-label="部位名" />
            {!!errors.name && <p>{errors.name.message}</p>}
            <div className={stack({ direction: "row", justify: "end" })}>
              <button type="submit" disabled={isEditLoading}>
                変更を保存する
              </button>
              <button
                onClick={onClickCancelEditButton}
                disabled={isEditLoading}
              >
                変更しない
              </button>
            </div>
            <button disabled={true}>{props.muscle.name}を削除する</button>
          </div>
        </form>
      ) : isConfirmingDelete ? (
        <div className={stack({ direction: "column" })}>
          <p>{props.muscle.name}</p>
          <button disabled={true}>{props.muscle.name}を編集する</button>
          <div className={stack({ direction: "row", justify: "end" })}>
            <button
              onClick={onClickConfirmDeleteButton}
              disabled={isDeleteLoading}
            >
              {props.muscle.name}を削除する
            </button>
            <button
              onClick={onClickCancelDeleteButton}
              disabled={isDeleteLoading}
            >
              削除しない
            </button>
          </div>
        </div>
      ) : (
        <div className={stack({ direction: "column" })}>
          <p>{props.muscle.name}</p>
          <button onClick={onClickEditButton}>
            {props.muscle.name}を編集する
          </button>
          <button onClick={onClickDeleteButton}>
            {props.muscle.name}を削除する
          </button>
        </div>
      )}
      <Toast />
    </>
  );
};
