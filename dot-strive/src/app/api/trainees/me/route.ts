import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { validateTrainee } from "@/app/_schemas/trainee";

import type { Trainee } from "@/app/_schemas/trainee";
import type { RouteHandler } from "@/app/api/_types/route-handler";

export const GET: RouteHandler<Trainee | null> = async (_req, _context) => {
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

  const data = await prisma.trainee.findUnique({
    where: {
      authUserId: session.user.id,
    },
  });
  if (!data) {
    return NextResponse.json(null);
  }

  const trainee = validateTrainee(data);
  if (trainee.isErr()) {
    return NextResponse.json(
      { error: "traineeのデータが不正です" },
      { status: 500 }
    );
  }

  return NextResponse.json(trainee.value);
};
