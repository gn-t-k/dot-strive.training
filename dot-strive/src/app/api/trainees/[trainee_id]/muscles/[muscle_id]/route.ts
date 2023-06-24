import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import prisma from "@/libs/prisma/client";

import { validateMuscle } from "@/features/muscle";

import type { RouteHandler } from "@/app/api/_utils/types";
import type { Muscle } from "@/features/muscle";

export const GET: RouteHandler<Muscle | null> = async (req, context) => {
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

  const muscleId = context?.params?.["muscle_id"];
  if (!muscleId) {
    return NextResponse.json(
      { error: "muscle-idが指定されていません" },
      { status: 400 }
    );
  }

  const data = await prisma.trainee.findUnique({
    where: {
      id: traineeId,
    },
    include: {
      muscles: {
        where: {
          id: muscleId,
        },
      },
    },
  });
  if (!data?.muscles[0] || data.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "muscleが取得できませんでした" },
      { status: 404 }
    );
  }

  if (data.muscles.length > 1) {
    return NextResponse.json(
      { error: "muscleのデータが不正です" },
      { status: 500 }
    );
  }

  const muscle = validateMuscle(data.muscles[0]);
  if (muscle.isErr()) {
    return NextResponse.json(
      { error: "muscleのデータが不正です" },
      { status: 500 }
    );
  }

  return NextResponse.json(muscle.value);
};

export const PATCH: RouteHandler<Muscle> = async (req, context) => {
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

  const muscleId = context?.params?.["muscle_id"];
  if (!muscleId) {
    return NextResponse.json(
      { error: "muscle-idが指定されていません" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const validateBodyResult = validateMuscle(body);
  if (validateBodyResult.isErr()) {
    return NextResponse.json(
      { error: "bodyの検証に失敗しました" },
      { status: 400 }
    );
  }
  const muscle = validateBodyResult.value;

  const existMuscle = await prisma.muscle.findUnique({
    where: {
      id: muscleId,
    },
    include: {
      trainee: {
        select: {
          authUserId: true,
        },
      },
    },
  });
  if (!existMuscle || existMuscle.trainee.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "muscleが取得できませんでした" },
      { status: 404 }
    );
  }

  try {
    const updated = await prisma.muscle.update({
      where: {
        id: muscleId,
      },
      data: {
        name: muscle.name,
      },
    });
    const validateUpdatedResult = validateMuscle(updated);

    if (validateUpdatedResult.isErr()) {
      return NextResponse.json(
        { error: "muscleの検証に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(validateUpdatedResult.value);
  } catch (error) {
    return NextResponse.json(
      { error: `muscleの更新に失敗しました: ${error}` },
      { status: 500 }
    );
  }
};

export const DELETE: RouteHandler<Muscle | null> = async (req, context) => {
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

  const muscleId = context?.params?.["muscle_id"];
  if (!muscleId) {
    return NextResponse.json(
      { error: "muscle-idが指定されていません" },
      { status: 400 }
    );
  }

  const existMuscle = await prisma.muscle.findUnique({
    where: {
      id: muscleId,
    },
    include: {
      trainee: true,
    },
  });
  if (!existMuscle || existMuscle.trainee.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "muscleが取得できませんでした" },
      { status: 404 }
    );
  }

  try {
    const deleted = await prisma.muscle.delete({
      where: {
        id: muscleId,
      },
    });

    const result = validateMuscle(deleted);
    if (result.isErr()) {
      return NextResponse.json(
        { error: "muscleの検証に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    return NextResponse.json(
      { error: `muscleの削除に失敗しました: ${error}` },
      { status: 500 }
    );
  }
};
