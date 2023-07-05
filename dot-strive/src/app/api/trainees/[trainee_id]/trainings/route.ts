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
  const training = validateBodyResult.value;

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
      { error: "trainingを作成できませんでした" },
      { status: 401 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.training.create({
        data: {
          id: training.id,
          createdAt: training.createdAt,
          updatedAt: training.createdAt,
          trainee: {
            connect: {
              id: trainee.id,
            },
          },
        },
      });

      await tx.record.createMany({
        data: training.records.map((record) => ({
          id: record.id,
          trainingId: training.id,
          exerciseId: record.exercise.id,
          memo: record.memo,
        })),
      });

      await tx.set.createMany({
        data: training.records.flatMap((record) =>
          record.sets.map((set) => ({
            id: set.id,
            recordId: record.id,
            weight: set.weight,
            repetition: set.repetition,
          }))
        ),
      });
    });

    return NextResponse.json(training);
  } catch (error) {
    return NextResponse.json(
      { error: "trainingを作成できませんでした" },
      { status: 500 }
    );
  }
};
