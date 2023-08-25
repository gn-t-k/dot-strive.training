"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteTraining } from "@/app/_actions/delete-training";
import { Button } from "@/app/_components/button";
import { stack } from "styled-system/patterns";

import { useToast } from "./use-toast";

import type { Training } from "@/app/_schemas/training";
import type { FC, MouseEventHandler } from "react";

type Props = {
  traineeId: string;
  training: Training;
};
export const TrainingDeletionAndConfirm: FC<Props> = (props) => {
  const router = useRouter();
  const { renderToast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  const onClickDelete: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    setIsConfirming(true);
  };
  const onClickExecute: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.preventDefault();

    const result = await deleteTraining({
      traineeId: props.traineeId,
      trainingId: props.training.id,
    });
    setIsConfirming(false);

    renderToast(
      result.isOk
        ? {
            title: "トレーニングを削除しました",
            variant: "success",
          }
        : {
            title: "トレーニングの削除に失敗しました",
            variant: "error",
          }
    );
    if (result.isOk) {
      router.push(`/trainees/${props.traineeId}/trainings`);
    }
  };
  const onClickCancel: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    setIsConfirming(false);
  };

  return isConfirming ? (
    <div className={stack({ direction: "row" })}>
      <Button onClick={onClickExecute} visual="negative">
        {new Date(props.training.date).toLocaleString("ja", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })}
        のトレーニングを削除する
      </Button>
      <Button onClick={onClickCancel}>キャンセル</Button>
    </div>
  ) : (
    <Button onClick={onClickDelete}>削除する</Button>
  );
};
