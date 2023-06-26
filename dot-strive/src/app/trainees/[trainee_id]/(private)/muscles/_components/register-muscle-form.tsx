"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";

import { useToast } from "@/app/_components/use-toast";
import { getFetcher } from "@/features/http-client/fetcher";
import { getMutator } from "@/features/http-client/mutator";
import { getAllMusclesBySession } from "@/features/muscle/get-all-by-session";
import { registerMuscle } from "@/features/muscle/register";
import { useMuscleForm } from "@/features/muscle/use-muscle-form";
import { stack } from "styled-system/patterns";

import type { MuscleField } from "@/features/muscle/use-muscle-form";
import type { SubmitHandler } from "react-hook-form";

type Props = {
  traineeId: string;
};
export const RegisterMuscleForm: FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
  } = useMuscleForm();
  const router = useRouter();
  const { Toast, renderToast } = useToast();

  const onSubmit: SubmitHandler<MuscleField> = async (fieldValues) => {
    setIsLoading(true);

    const registeredMuscles = await getAllMusclesBySession({
      fetcher: getFetcher(),
    })({
      traineeId: props.traineeId,
    });
    if (registeredMuscles.isErr()) {
      setIsLoading(false);
      renderToast({
        title: `部位「${fieldValues.name}」の登録に失敗しました`,
        variant: "error",
      });

      return;
    }

    const isSameNameMuscleExist = registeredMuscles.value.some(
      (muscle) => muscle.name === fieldValues.name
    );

    if (isSameNameMuscleExist) {
      setIsLoading(false);
      setError("name", {
        type: "custom",
        message: `部位「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    const result = await registerMuscle({
      mutator: getMutator(),
    })({
      traineeId: props.traineeId,
      muscleName: fieldValues.name,
    });
    setIsLoading(false);

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
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={stack({ direction: "column" })}>
          <div className={stack({ direction: "row" })}>
            <input {...register("name")} aria-label="部位名" />
            <button type="submit" disabled={isLoading}>
              部位を登録する
            </button>
          </div>
          {!!errors.name && <p>{errors.name.message}</p>}
        </div>
      </form>
      <Toast />
    </>
  );
};
