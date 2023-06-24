import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import prisma from "@/libs/prisma/client";

import { validateMuscle } from "@/features/muscle";

import type { RouteHandler } from "@/app/api/_utils/types";
import type { Muscle } from "@/features/muscle";

export const GET: RouteHandler<Muscle[]> = async (_req, context) => {
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

  const data = await prisma.trainee.findUnique({
    where: {
      id: traineeId,
    },
    include: {
      muscles: true,
    },
  });
  if (!data || data.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "musclesを取得できませんでした" },
      { status: 404 }
    );
  }

  const muscles = data.muscles
    .map(validateMuscle)
    .flatMap((muscle) => (muscle.isErr() ? [] : [muscle.value]));

  return NextResponse.json(muscles);
};

export const POST: RouteHandler<Muscle> = async (req, context) => {
  const data = await req.json();
  const validateBodyResult = validateMuscle(data);

  if (validateBodyResult.isErr()) {
    return NextResponse.json(
      { error: "bodyの検証に失敗しました" },
      { status: 400 }
    );
  }
  const body = validateBodyResult.value;

  const traineeId = context?.params?.["trainee_id"];
  if (!traineeId) {
    return NextResponse.json(
      { error: "trainee-idが指定されていません" },
      { status: 400 }
    );
  }

  try {
    const created = await prisma.muscle.create({
      data: {
        id: body.id,
        name: body.name,
        traineeId,
      },
    });

    const validateCreatedResult = validateMuscle(created);
    if (validateCreatedResult.isErr()) {
      return NextResponse.json(
        { error: "muscleの検証に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(validateCreatedResult.value);
  } catch (error) {
    return NextResponse.json(
      { error: `muscleの作成に失敗しました: ${error}` },
      { status: 500 }
    );
  }
};
