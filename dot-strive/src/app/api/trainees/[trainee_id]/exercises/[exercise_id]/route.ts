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
      { error: "exerciseのデータが不正です" },
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

export const PATCH: RouteHandler<Exercise> = async (req, context) => {
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

  const body = await req.json();
  const validatedBodyResult = validateExercise(body);
  if (
    validatedBodyResult.isErr() ||
    validatedBodyResult.value.id !== exerciseId
  ) {
    return NextResponse.json(
      { error: "bodyの検証に失敗しました" },
      { status: 400 }
    );
  }
  const afterExercise = validatedBodyResult.value;

  const beforeExercise = await prisma.exercise.findUnique({
    where: {
      id: exerciseId,
    },
    include: {
      trainee: {
        select: {
          authUserId: true,
        },
      },
      targets: true,
    },
  });
  if (
    !beforeExercise ||
    beforeExercise.trainee.authUserId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "exerciseを取得できませんでした" },
      { status: 404 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.exercise.update({
        where: {
          id: exerciseId,
        },
        data: {
          targets: {
            disconnect: beforeExercise.targets.map((target) => ({
              id: target.id,
            })),
          },
        },
      });

      await tx.exercise.update({
        where: {
          id: exerciseId,
        },
        data: {
          targets: {
            connect: afterExercise.targets.map((target) => ({ id: target.id })),
          },
        },
        include: {
          targets: true,
        },
      });
    });
    const unvalidatedUpdated = await prisma.exercise.update({
      where: {
        id: exerciseId,
      },
      data: {
        name: afterExercise.name,
      },
      include: {
        targets: true,
      },
    });

    const validateResult = validateExercise({
      ...unvalidatedUpdated,
      targets: unvalidatedUpdated.targets.flatMap((target) => {
        const validateMuscleResult = validateMuscle(target);

        return validateMuscleResult.isErr() ? [] : [validateMuscleResult.value];
      }),
    });

    if (validateResult.isErr()) {
      return NextResponse.json(
        { error: "exerciseのデータが不正です" },
        { status: 500 }
      );
    }

    return NextResponse.json(validateResult.value);
  } catch (error) {
    return NextResponse.json(
      { error: "exerciseの更新に失敗しました" },
      { status: 500 }
    );
  }
};

export const DELETE: RouteHandler<Exercise> = async (req, context) => {
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
      { error: "exerciseのデータが不正です" },
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

  try {
    const result = await prisma.exercise.delete({
      where: {
        id: exerciseId,
      },
      include: {
        targets: true,
      },
    });

    const validateResult = validateExercise({
      ...result,
      targets: result.targets.flatMap((target) => {
        const validateMuscleResult = validateMuscle(target);

        return validateMuscleResult.isErr() ? [] : [validateMuscleResult.value];
      }),
    });
    if (validateResult.isErr()) {
      return NextResponse.json(
        { error: "exerciseのデータが不正です" },
        { status: 500 }
      );
    }

    return NextResponse.json(validateResult.value);
  } catch (error) {
    return NextResponse.json(
      { error: "exerciseの削除に失敗しました" },
      { status: 500 }
    );
  }
};
