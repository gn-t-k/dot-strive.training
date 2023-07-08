import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { validateTraining } from "@/app/_schemas/training";

import type { Training } from "@/app/_schemas/training";
import type { RouteHandler } from "@/app/api/_types/route-handler";

export const GET: RouteHandler<Training> = async (_req, context) => {
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

  const traineeId = context?.params?.["trainee_id"];
  if (!traineeId) {
    return NextResponse.json(
      { error: "trainee-idが指定されていません" },
      { status: 400 }
    );
  }
  const trainingId = context?.params?.["training_id"];
  if (!trainingId) {
    return NextResponse.json(
      { error: "training-idが指定されていません" },
      { status: 400 }
    );
  }

  const data = await prisma?.trainee.findUnique({
    where: {
      id: traineeId,
    },
    include: {
      trainings: {
        where: {
          id: trainingId,
        },
        include: {
          records: {
            include: {
              exercise: {
                include: {
                  targets: true,
                },
              },
              sets: true,
            },
          },
        },
      },
    },
  });

  if (!data || data.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "trainingsを取得できませんでした" },
      { status: 404 }
    );
  }

  if (data.trainings.length > 1 || !data.trainings[0]) {
    return NextResponse.json(
      { error: "trainingのデータが不正です" },
      { status: 500 }
    );
  }

  const validateTrainingResult = validateTraining({
    ...data.trainings[0],
    date: data.trainings[0].date.toISOString(),
  });
  if (validateTrainingResult.isErr()) {
    return NextResponse.json(
      {
        error: `trainingの取得に失敗しました: ${validateTrainingResult.error}`,
      },
      { status: 500 }
    );
  }
  const training = validateTrainingResult.value;

  return NextResponse.json(training);
};
