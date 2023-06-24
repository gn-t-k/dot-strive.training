import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import prisma from "@/libs/prisma/client";

import { validateExercise } from "@/features/exercise";
import { validateMuscle } from "@/features/muscle";

import type { RouteHandler } from "@/app/api/_utils/types";
import type { Exercise } from "@/features/exercise";

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

        return validateMuscleResult.isErr() ? [] : [validateMuscleResult.value];
      }),
    }))
    .map(validateExercise)
    .flatMap((validateExerciseResult) =>
      validateExerciseResult.isErr() ? [] : [validateExerciseResult.value]
    );

  return NextResponse.json(exercises);
};
