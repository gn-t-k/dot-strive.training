"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Stack,
  Text,
  useToast,
} from "@/libs/chakra-ui";

import { getFetcher } from "@/features/http-client/fetcher";
import { getMutator } from "@/features/http-client/mutator";
import { deleteMuscle } from "@/features/muscle/delete";
import { getAllMusclesBySession } from "@/features/muscle/get-all-by-session";
import { updateMuscle } from "@/features/muscle/update";
import { useMuscleForm } from "@/features/muscle/use-muscle-form";

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
  const toast = useToast();

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
      toast({
        title: "部位の更新に失敗しました",
        status: "error",
        isClosable: true,
      });
      return;
    }

    if (
      registeredMuscles.value.some((muscle) => muscle.name === fieldValues.name)
    ) {
      setIsEditLoading(false);
      toast({
        title: `部位「${fieldValues.name}」はすでに登録されています`,
        status: "error",
        isClosable: true,
      });
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

    toast(
      result.isOk()
        ? {
            title: `部位「${props.muscle.name}」の名前を「${result.value.name}」に更新しました`,
            status: "success",
            isClosable: true,
          }
        : {
            title: "部位の更新に失敗しました",
            status: "error",
            isClosable: true,
          }
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
      mutator: getMutator({
        method: "DELETE",
      }),
    })({
      traineeId: props.traineeId,
      muscleId: props.muscle.id,
    });
    setIsDeleteLoading(false);

    toast(
      result.isOk()
        ? {
            title: `部位「${result.value.name}」を削除しました`,
            status: "success",
            isClosable: true,
          }
        : {
            title: "部位の削除に失敗しました",
            status: "error",
            isClosable: true,
          }
    );
    setIsConfirmingDelete(false);
    router.refresh();
  };

  return isEditing ? (
    <form onSubmit={handleSubmit(onClickSaveButton)}>
      <FormControl isInvalid={!!errors.name}>
        <Stack direction="column">
          <Input {...register("name")} aria-label="部位名" />
          {!!errors.name && (
            <FormErrorMessage>{errors.name.message}</FormErrorMessage>
          )}
          <Stack direction="row" justify="end">
            <Button
              onClick={onClickCancelEditButton}
              isLoading={isEditLoading}
              isDisabled={isEditLoading}
            >
              編集をやめる
            </Button>
            <Button
              type="submit"
              isLoading={isEditLoading}
              isDisabled={isEditLoading}
            >
              変更を保存する
            </Button>
          </Stack>
          <Button isDisabled={true}>{props.muscle.name}を削除する</Button>
        </Stack>
      </FormControl>
    </form>
  ) : isConfirmingDelete ? (
    <Stack direction="column">
      <Text>{props.muscle.name}</Text>
      <Button isDisabled={true}>{props.muscle.name}を編集する</Button>
      <Stack direction="row" justify="end">
        <Button
          onClick={onClickCancelDeleteButton}
          isLoading={isDeleteLoading}
          isDisabled={isDeleteLoading}
        >
          削除しない
        </Button>
        <Button
          onClick={onClickConfirmDeleteButton}
          isLoading={isDeleteLoading}
          isDisabled={isDeleteLoading}
        >
          {props.muscle.name}を削除する
        </Button>
      </Stack>
    </Stack>
  ) : (
    <Stack direction="column">
      <Text>{props.muscle.name}</Text>
      <Button onClick={onClickEditButton}>{props.muscle.name}を編集する</Button>
      <Button onClick={onClickDeleteButton}>
        {props.muscle.name}を削除する
      </Button>
    </Stack>
  );
};
