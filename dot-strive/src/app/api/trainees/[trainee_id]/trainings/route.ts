import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { validateTraining } from "@/app/_schemas/training";

import type { Training } from "@/app/_schemas/training";
import type { RouteHandler } from "@/app/api/_types/route-handler";

export const POST: RouteHandler<Training> = async (req, context) => {
  const session = await getServerSession(nextAuthOptions);
  if (!session?.user.id) {
    return NextResponse.json(
      {
        error: "セッションが取得できませんでした",
      },
      {
        status: 401,
      }
    );
  }

  const data = await req.json();
  const validateBodyResult = validateTraining(data);

  if (validateBodyResult.isErr()) {
    return NextResponse.json(
      { error: "bodyの検証に失敗しました" },
      { status: 400 }
    );
  }
  const newTraining = validateBodyResult.value;

  const traineeId = context?.params?.["trainee_id"];
  if (!traineeId) {
    return NextResponse.json(
      { error: "trainee-idが指定されていません" },
      { status: 400 }
    );
  }

  const trainee = await prisma.trainee.findUnique({
    where: {
      id: traineeId,
    },
  });
  if (trainee?.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "trainingを保存できませんでした" },
      { status: 401 }
    );
  }

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
    },
  });

  try {
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
                id: trainee.id,
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
          })),
        });

        await tx.set.createMany({
          data: newTraining.records.flatMap((record) =>
            record.sets.map((set) => ({
              id: set.id,
              recordId: record.id,
              weight: set.weight,
              repetition: set.repetition,
            }))
          ),
        });
      } else {
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
          })),
        });

        await tx.set.createMany({
          data: newTraining.records.flatMap((record) =>
            record.sets.map((set) => ({
              id: set.id,
              recordId: record.id,
              weight: set.weight,
              repetition: set.repetition,
            }))
          ),
        });
      }
    });

    return NextResponse.json(newTraining);
  } catch (error) {
    return NextResponse.json(
      { error: "trainingを作成できませんでした" },
      { status: 500 }
    );
  }
};
