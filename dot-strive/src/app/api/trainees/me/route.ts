import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/libs/next-auth/options";
import prisma from "@/libs/prisma/client";

import { validateTrainee } from "@/features/trainee";

import type { RouteHandler } from "../../_utils/types";
import type { Trainee } from "@/features/trainee";

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
