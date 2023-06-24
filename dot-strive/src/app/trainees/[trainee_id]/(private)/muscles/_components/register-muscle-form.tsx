"use client";

import { useRouter } from "next/navigation";
import { useState, type FC } from "react";

import {
  FormControl,
  Stack,
  Input,
  Button,
  FormErrorMessage,
  Spacer,
  useToast,
} from "@/libs/chakra-ui";

import { getMutator } from "@/features/http-client/mutator";
import { registerMuscle } from "@/features/muscle/register";
import { useMuscleForm } from "@/features/muscle/use-muscle-form";

import type { Muscle } from "@/features/muscle";
import type { MuscleField } from "@/features/muscle/use-muscle-form";
import type { SubmitHandler } from "react-hook-form";

type Props = {
  traineeId: string;
  registeredMuscles: Muscle[];
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
  const toast = useToast();

  const onSubmit: SubmitHandler<MuscleField> = async (fieldValues) => {
    const isSameNameMuscleExist = props.registeredMuscles.some(
      (muscle) => muscle.name === fieldValues.name
    );

    if (isSameNameMuscleExist) {
      setError("name", {
        type: "custom",
        message: `部位「${fieldValues.name}」はすでに登録されています`,
      });

      return;
    }

    setIsLoading(true);
    const result = await registerMuscle({
      mutator: getMutator(),
    })({
      traineeId: props.traineeId,
      muscleName: fieldValues.name,
    });
    setIsLoading(false);

    toast(
      result.isOk()
        ? {
            title: `部位「${fieldValues.name}」を登録しました`,
            status: "success",
            isClosable: true,
          }
        : {
            title: `部位「${fieldValues.name}」の登録に失敗しました`,
            status: "error",
            isClosable: true,
          }
    );

    router.refresh();
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.name}>
        <Stack direction="column">
          <Stack direction="row">
            <Input {...register("name")} aria-label="部位名" />
            <Spacer />
            <Button type="submit" isLoading={isLoading} isDisabled={isLoading}>
              部位を登録する
            </Button>
          </Stack>
          {!!errors.name && (
            <FormErrorMessage>{errors.name.message}</FormErrorMessage>
          )}
        </Stack>
      </FormControl>
    </form>
  );
};
