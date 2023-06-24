import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import { prisma } from "@/libs/prisma/client";

import { validateExercise } from "@/features/exercise";
import { validateMuscle } from "@/features/muscle";

import type { RouteHandler } from "@/app/api/_utils/types";
import type { Exercise } from "@/features/exercise";

export const GET: RouteHandler<Exercise> = async (req, context) => {
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

  const exerciseId = context?.params?.["exercise_id"];
  if (!exerciseId) {
    return NextResponse.json(
      { error: "exercise-idが指定されていません" },
      { status: 400 }
    );
  }

  const data = await prisma.trainee.findUnique({
    where: {
      id: traineeId,
    },
    include: {
      exercises: {
        where: {
          id: exerciseId,
        },
        include: {
          targets: true,
        },
      },
    },
  });
  if (!data?.exercises[0] || data.authUserId !== session.user.id) {
    return NextResponse.json(
      { error: "exerciseを取得できませんでした" },
      { status: 404 }
    );
  }
  if (data.exercises.length > 1) {
    return NextResponse.json(
      { error: "exerciseが複数存在します" },
      { status: 500 }
    );
  }

  const exercise = validateExercise({
    ...data.exercises[0],
    targets: data.exercises[0].targets.flatMap((target) => {
      const validateMuscleResult = validateMuscle(target);

      return validateMuscleResult.isErr() ? [] : [validateMuscleResult.value];
    }),
  });
  if (exercise.isErr()) {
    return NextResponse.json(
      { error: "exerciseのデータが不正です" },
      { status: 500 }
    );
  }

  return NextResponse.json(exercise.value);
};
