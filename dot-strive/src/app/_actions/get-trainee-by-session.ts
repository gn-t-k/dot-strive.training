"use server";

import { getServerSession } from "next-auth";

import { prisma } from "@/app/_libs/prisma/client";

import { nextAuthOptions } from "../_libs/next-auth/options";
import { validateTrainee } from "../_schemas/trainee";
import { err, ok } from "../_utils/result";

import type { Result } from "../_utils/result";
import type { Trainee } from "@prisma/client";

type GetTraineeBySession = () => Promise<Result<Trainee, Error>>;
export const getTraineeBySession: GetTraineeBySession = async () => {
  try {
    const session = await getServerSession(nextAuthOptions);
    if (!session?.user.id) {
      throw new Error(`セッションが取得できませんでした`);
    }

    const data = await prisma.trainee.findUnique({
      where: {
        authUserId: session.user.id,
      },
    });
    if (!data) {
      throw new Error(
        `トレーニーが見つかりませんでした: ${JSON.stringify(session)}`
      );
    }

    const result = validateTrainee(data);
    if (result.isErr) {
      throw new Error(
        `トレーニーの検証に失敗しました: ${result.error.message}`
      );
    }

    return ok({
      ...result.value,
      authUserId: session.user.id,
    });
  } catch (error) {
    return err(
      new Error(
        `トレーニーの取得に失敗しました: ${
          error instanceof Error ? error.message : JSON.stringify(error)
        }`
      )
    );
  }
};
