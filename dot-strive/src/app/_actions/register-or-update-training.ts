"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getTraineeBySession } from "./get-trainee-by-session";
import { err, ok } from "../_utils/result";

import type { Training } from "../_schemas/training";
import type { Result } from "../_utils/result";

type RegisterOrUpdateTraining = (props: {
  traineeId: string;
  training: Training;
}) => Promise<Result<Training, Error>>;
export const registerOrUpdateTraining: RegisterOrUpdateTraining = async (
  props
) => {
  try {
    const trainee = await getTraineeBySession();
    if (trainee.isErr) {
      throw new Error(
        `トレーニーの取得に失敗しました: ${trainee.error.message}`
      );
    }
    if (trainee.value.id !== props.traineeId) {
      throw new Error(
        `認証に失敗しました: ${JSON.stringify({
          sessionTraineeId: trainee.value.id,
          propsTraineeId: props.traineeId,
        })}`
      );
    }

    const newTraining = props.training;
    const oldTraining = await prisma.training.findUnique({
      where: {
        id: newTraining.id,
      },
      include: {
        records: {
          include: {
            sets: true,
          },
        },
        trainee: true,
      },
    });

    await prisma.$transaction(async (tx) => {
      const executedAt = new Date();
      const newTrainingDate = new Date(newTraining.date);

      if (oldTraining === null) {
        const [year, month, day, hours, minutes, seconds, milliseconds] = [
          newTrainingDate.getUTCFullYear(),
          newTrainingDate.getUTCMonth(),
          newTrainingDate.getUTCDate(),
          executedAt.getUTCHours(),
          executedAt.getUTCMinutes(),
          executedAt.getUTCSeconds(),
          executedAt.getUTCMilliseconds(),
        ];
        const combinedDate = new Date(
          Date.UTC(year, month, day, hours, minutes, seconds, milliseconds)
        );

        await tx.training.create({
          data: {
            id: newTraining.id,
            date: combinedDate,
            createdAt: executedAt,
            updatedAt: executedAt,
            trainee: {
              connect: {
                id: trainee.value.id,
              },
            },
          },
        });

        await tx.record.createMany({
          data: newTraining.records.map((record) => ({
            id: record.id,
            trainingId: newTraining.id,
            exerciseId: record.exercise.id,
            memo: record.memo,
            order: record.order,
          })),
        });

        await tx.set.createMany({
          data: newTraining.records.flatMap((record) =>
            record.sets.map((set) => ({
              id: set.id,
              recordId: record.id,
              weight: set.weight,
              repetition: set.repetition,
              estimatedMaximumWeight: set.estimatedMaximumWeight,
              order: set.order,
            }))
          ),
        });
      } else {
        if (oldTraining.trainee.id !== trainee.value.id) {
          throw new Error(
            `認証に失敗しました: ${JSON.stringify({
              trainingTraineeId: oldTraining.trainee.id,
              propsTraineeId: props.traineeId,
            })}`
          );
        }

        const [year, month, day, hours, minutes, seconds, milliseconds] = [
          newTrainingDate.getUTCFullYear(),
          newTrainingDate.getUTCMonth(),
          newTrainingDate.getUTCDate(),
          oldTraining.date.getUTCHours(),
          oldTraining.date.getUTCMinutes(),
          oldTraining.date.getUTCSeconds(),
          oldTraining.date.getUTCMilliseconds(),
        ];
        const combinedDate = new Date(
          Date.UTC(year, month, day, hours, minutes, seconds, milliseconds)
        );

        await tx.set.deleteMany({
          where: {
            id: {
              in: oldTraining.records.flatMap((record) =>
                record.sets.map((set) => set.id)
              ),
            },
          },
        });

        await tx.record.deleteMany({
          where: {
            id: {
              in: oldTraining.records.map((record) => record.id),
            },
          },
        });

        await tx.training.update({
          where: {
            id: newTraining.id,
          },
          data: {
            updatedAt: executedAt,
            date: combinedDate,
          },
        });

        await tx.record.createMany({
          data: newTraining.records.map((record) => ({
            id: record.id,
            trainingId: newTraining.id,
            exerciseId: record.exercise.id,
            memo: record.memo,
            order: record.order,
          })),
        });

        await tx.set.createMany({
          data: newTraining.records.flatMap((record) =>
            record.sets.map((set) => ({
              id: set.id,
              recordId: record.id,
              weight: set.weight,
              repetition: set.repetition,
              estimatedMaximumWeight: set.estimatedMaximumWeight,
              order: set.order,
            }))
          ),
        });
      }
    });

    return ok(newTraining);
  } catch (error) {
    return err(
      new Error(
        `トレーニングデータの更新に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
