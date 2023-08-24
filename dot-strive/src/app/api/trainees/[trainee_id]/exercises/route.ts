import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { validateExercise } from "@/app/_schemas/exercise";
import { validateMuscle } from "@/app/_schemas/muscle";

import type { Exercise } from "@/app/_schemas/exercise";
import type { RouteHandler } from "@/app/api/_types/route-handler";

export const GET: RouteHandler<Exercise[]> = async (req, context) => {
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
      exercises: {
        include: {
          targets: true,
        },
      },
    },
  });
  if (!data || data.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "exercisesを取得できませんでした" },
      { status: 404 }
    );
  }

  const exercises = data.exercises
    .map((exercise) => ({
      ...exercise,
      targets: exercise.targets.flatMap((target) => {
        const validateMuscleResult = validateMuscle(target);

        return validateMuscleResult.isErr ? [] : [validateMuscleResult.value];
      }),
    }))
    .map(validateExercise)
    .flatMap((validateExerciseResult) =>
      validateExerciseResult.isErr ? [] : [validateExerciseResult.value]
    );

  return NextResponse.json(exercises);
};

export const POST: RouteHandler<Exercise> = async (req, context) => {
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
  const validateBodyResult = validateExercise(data);

  if (validateBodyResult.isErr) {
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

  const trainee = await prisma.trainee.findUnique({
    where: {
      id: traineeId,
    },
  });
  if (trainee?.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "exerciseを作成できませんでした" },
      { status: 401 }
    );
  }

  try {
    const created = await prisma.exercise.create({
      data: {
        id: body.id,
        name: body.name,
        targets: {
          connect: body.targets.map((target) => ({ id: target.id })),
        },
        traineeId: traineeId,
      },
      include: {
        targets: true,
      },
    });

    const validateCreatedResult = validateExercise(created);
    if (validateCreatedResult.isErr) {
      return NextResponse.json(
        { error: "exerciseの検証に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json(validateCreatedResult.value);
  } catch (error) {
    return NextResponse.json(
      { error: `exerciseの作成に失敗しました: ${error}` },
      { status: 500 }
    );
  }
};
