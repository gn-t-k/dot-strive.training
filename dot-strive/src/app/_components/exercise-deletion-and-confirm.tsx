"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteExercise } from "@/app/_actions/delete-exercise";
import { Button } from "@/app/_components/button";
import { stack } from "styled-system/patterns";

import { useToast } from "./use-toast";

import type { Exercise } from "@/app/_schemas/exercise";
import type { FC, MouseEventHandler } from "react";

type Props = {
  traineeId: string;
  exercise: Exercise;
};
export const ExerciseDeletionAndConfirm: FC<Props> = (props) => {
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

    const result = await deleteExercise({
      traineeId: props.traineeId,
      exerciseId: props.exercise.id,
    });
    setIsConfirming(false);

    renderToast(
      result.isOk
        ? {
            title: `種目「${props.exercise.name}」を削除しました`,
            variant: "success",
          }
        : {
            title: `種目「${props.exercise.name}」の削除に失敗しました`,
            variant: "error",
          }
    );
    if (result.isOk) {
      router.push(`/trainees/${props.traineeId}`);
    }
  };
  const onClickCancel: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    setIsConfirming(false);
  };

  return isConfirming ? (
    <div className={stack({ direction: "row" })}>
      <Button onClick={onClickExecute} visual="negative">
        {props.exercise.name}を削除する
      </Button>
      <Button onClick={onClickCancel}>キャンセル</Button>
    </div>
  ) : (
    <Button onClick={onClickDelete}>{props.exercise.name}を削除する</Button>
  );
};
