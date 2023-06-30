"use client";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_hooks/use-toast";

import { RegisterMuscleForm } from "./register-muscle-form";

import type { AfterRegister } from "./register-muscle-form";
import type { Muscle } from "@/app/_schemas/muscle";
import type { FC } from "react";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
};
export const RegisterMuscle: FC<Props> = (props) => {
  const { renderToast } = useToast();
  const router = useRouter();
  const afterRegister: AfterRegister = (fieldValues, result) => {
    renderToast(
      result.isOk()
        ? {
            title: `部位「${fieldValues.name}」を登録しました`,
            variant: "success",
          }
        : {
            title: `部位「${fieldValues.name}」の登録に失敗しました`,
            variant: "error",
          }
    );

    router.refresh();
    router.push(`/trainees/${props.traineeId}/muscles`);
  };

  return (
    <RegisterMuscleForm
      traineeId={props.traineeId}
      registeredMuscles={props.registeredMuscles}
      afterRegister={afterRegister}
    />
  );
};
