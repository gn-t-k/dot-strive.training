"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { deleteMuscle } from "@/app/_actions/delete-muscle";
import { Button } from "@/app/_components/button";
import { useToast } from "@/app/_hooks/use-toast";
import { stack } from "styled-system/patterns";

import type { Muscle } from "@/app/_schemas/muscle";
import type { FC, MouseEventHandler } from "react";

type Props = {
  traineeId: string;
  muscle: Muscle;
};
export const MuscleDeletionAndConfirm: FC<Props> = (props) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { renderToast } = useToast();
  const router = useRouter();

  const onClickDeleteButton = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      event.preventDefault();

      setIsConfirming(true);
    },
    []
  );
  const onClickExecute = useCallback<MouseEventHandler<HTMLButtonElement>>(
    async (event) => {
      event.preventDefault();
      setIsLoading(true);

      const result = await deleteMuscle({
        traineeId: props.traineeId,
        muscleId: props.muscle.id,
      });

      setIsLoading(false);
      renderToast(
        result.isOk
          ? {
              title: `部位「${result.value.name}」を削除しました`,
              variant: "success",
            }
          : { title: "部位の削除に失敗しました", variant: "error" }
      );
      router.refresh();
      if (result.isOk) {
        router.replace(`/trainees/${props.traineeId}/muscles`);
      }
    },
    [props.muscle.id, props.traineeId, renderToast, router]
  );
  const onClickCancel = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      event.preventDefault();

      setIsConfirming(false);
    },
    []
  );

  return isConfirming ? (
    <div className={stack({ direction: "row", justify: "end" })}>
      <Button onClick={onClickExecute} disabled={isLoading} visual="negative">
        {props.muscle.name}を削除する
      </Button>
      <Button onClick={onClickCancel} disabled={isLoading} visual="neutral">
        削除しない
      </Button>
    </div>
  ) : (
    <Button onClick={onClickDeleteButton} disabled={isLoading} visual="neutral">
      削除する
    </Button>
  );
};
