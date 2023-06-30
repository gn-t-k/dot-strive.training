"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { useToast } from "@/app/_hooks/use-toast";

import { UpdateMuscleForm } from "./update-muscle-form";

import type { AfterDelete, AfterUpdate } from "./update-muscle-form";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  muscle: Muscle;
  registeredMuscles: Muscle[];
};
export const UpdateMuscle: FC<Props> = (props) => {
  const { renderToast } = useToast();
  const router = useRouter();

  const afterUpdate = useCallback<AfterUpdate>(
    (fieldValues, result) => {
      router.refresh();
      renderToast(
        result.isOk()
          ? {
              title: `部位「${props.muscle.name}」の名前を「${result.value.name}」に更新しました`,
              variant: "success",
            }
          : { title: "部位の更新に失敗しました", variant: "error" }
      );
    },
    [props.muscle.name, renderToast, router]
  );
  const afterDelete = useCallback<AfterDelete>(
    (result) => {
      renderToast(
        result.isOk()
          ? {
              title: `部位「${result.value.name}」を削除しました`,
              variant: "success",
            }
          : { title: "部位の削除に失敗しました", variant: "error" }
      );
      router.refresh();
      if (result.isOk()) {
        router.replace(`/trainees/${props.traineeId}/muscles`);
      }
    },
    [props.traineeId, renderToast, router]
  );

  return (
    <UpdateMuscleForm
      traineeId={props.traineeId}
      muscle={props.muscle}
      registeredMuscles={props.registeredMuscles}
      afterUpdate={afterUpdate}
      afterDelete={afterDelete}
    />
  );
};
