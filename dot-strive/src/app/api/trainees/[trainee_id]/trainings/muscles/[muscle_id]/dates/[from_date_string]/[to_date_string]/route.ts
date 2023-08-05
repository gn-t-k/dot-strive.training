import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { validateTraining } from "@/app/_schemas/training";

import type { Training } from "@/app/_schemas/training";
import type { RouteHandler } from "@/app/api/_types/route-handler";

/**
 * トレーニングを部位と期間で絞り込んで取得する
 */
export const GET: RouteHandler<Training[]> = async (_req, context) => {
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
  const fromDateString = context?.params?.["from_date_string"];
  if (!fromDateString || isNaN(Date.parse(fromDateString))) {
    return NextResponse.json(
      { error: "from-date-stringが適切に指定されていません" },
      { status: 400 }
    );
  }
  const toDateString = context?.params?.["to_date_string"];
  if (!toDateString || isNaN(Date.parse(toDateString))) {
    return NextResponse.json(
      { error: "to-date-stringが適切に指定されていません" },
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
          date: {
            gte: new Date(fromDateString),
            lte: new Date(toDateString),
          },
          records: {
            some: {
              exercise: {
                targets: {
                  some: {
                    id: muscleId,
                  },
                },
              },
            },
          },
        },
        include: {
          records: {
            include: {
              exercise: {
                include: {
                  targets: true,
                },
              },
              sets: {
                orderBy: {
                  order: "asc",
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          date: "asc",
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

  const trainings = data.trainings
    .map((training) =>
      validateTraining({
        ...training,
        date: training.date.toISOString(),
      })
    )
    .flatMap((validationResult) =>
      validationResult.isErr() ? [] : [validationResult.value]
    );

  return NextResponse.json(trainings);
};
