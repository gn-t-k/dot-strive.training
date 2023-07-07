import { err, ok } from "neverthrow";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ulid } from "ulid";

import { nextAuthOptions } from "@/app/_libs/next-auth/options";
import { prisma } from "@/app/_libs/prisma/client";
import { validateExercise, type Exercise } from "@/app/_schemas/exercise";
import { validateMuscle } from "@/app/_schemas/muscle";
import { validateTrainee } from "@/app/_schemas/trainee";

import type { Muscle } from "@/app/_schemas/muscle";
import type { Trainee } from "@/app/_schemas/trainee";
import type { RouteHandler } from "@/app/api/_types/route-handler";
import type { Result } from "neverthrow";
import type { Session } from "next-auth";

export const POST: RouteHandler = async (_req, _context) => {
  try {
    await prisma.$transaction(async (tx) => {
      const session = await getServerSession(nextAuthOptions);
      if (!session?.user.id) {
        throw new Error("セッションが取得できませんでした");
      }

      const registerTraineeResult = await registerTrainee({
        session,
        authUserId: session.user.id,
        prisma: tx,
      });
      if (registerTraineeResult.isErr()) {
        throw new Error(
          `トレーニーの登録に失敗しました: ${registerTraineeResult.error}`
        );
      }
      const trainee = registerTraineeResult.value;

      const registerMusclesResult = await registerMuscles({
        trainee,
        prisma: tx,
      });
      if (registerMusclesResult.isErr()) {
        throw new Error(
          `部位の登録に失敗しました: ${registerMusclesResult.error}`
        );
      }
      const muscles = registerMusclesResult.value;

      const registerExercisesResult = await registerExercises({
        trainee,
        muscles,
        prisma: tx,
      });
      if (registerExercisesResult.isErr()) {
        throw new Error(
          `種目の登録に失敗しました: ${registerExercisesResult.error}`
        );
      }
    });

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json(
      {
        error: `初期登録に失敗しました${
          error instanceof Error ? `: ${error.message}` : ""
        }`,
      },
      {
        status: 500,
      }
    );
  }
};

type DefaultExercise = {
  exerciseName: string;
  targetNames: string[];
};
const defaultExercises: DefaultExercise[] = [
  {
    exerciseName: "ベンチプレス",
    targetNames: ["大胸筋", "三角筋前部", "上腕三頭筋"],
  },
  {
    exerciseName: "スクワット",
    targetNames: ["大腿四頭筋", "ハムストリングス", "大殿筋", "ふくらはぎ"],
  },
  {
    exerciseName: "デッドリフト",
    targetNames: ["脊柱起立筋", "僧帽筋", "ハムストリングス", "大殿筋"],
  },
  {
    exerciseName: "オーバーヘッドプレス",
    targetNames: ["三角筋前部", "上腕三頭筋"],
  },
  {
    exerciseName: "ベントオーバーロウ",
    targetNames: ["広背筋", "僧帽筋", "三角筋後部"],
  },
  {
    exerciseName: "チンニング",
    targetNames: ["広背筋", "上腕二頭筋", "三角筋後部"],
  },
  {
    exerciseName: "プルオーバー",
    targetNames: ["大胸筋", "広背筋", "上腕三頭筋"],
  },
  {
    exerciseName: "サイドレイズ",
    targetNames: ["三角筋中部"],
  },
  {
    exerciseName: "カーフレイズ",
    targetNames: ["ふくらはぎ"],
  },
  {
    exerciseName: "アームカール",
    targetNames: ["上腕二頭筋"],
  },
];

type OnboardingError = {
  message: string;
  status: number;
};
type Transaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

type RegisterTrainee = (
  props: RegisterTraineeProps
) => Promise<Result<Trainee, OnboardingError>>;
type RegisterTraineeProps = {
  session: Session;
  authUserId: string;
  prisma: Transaction;
};
const registerTrainee: RegisterTrainee = async (props) => {
  const unvalidatedTrainee = validateTrainee({
    id: ulid(),
    name: props.session.user.name ?? "",
    image: props.session.user.image ?? "",
  });
  if (unvalidatedTrainee.isErr()) {
    return err({
      message: "トレーニーの登録に失敗しました",
      status: 500,
    });
  }

  try {
    const created = await props.prisma.trainee.create({
      data: {
        ...unvalidatedTrainee.value,
        authUserId: props.authUserId,
      },
    });
    const validated = validateTrainee(created);
    if (validated.isErr()) {
      return err({
        message: "トレーニーの登録に失敗しました",
        status: 500,
      });
    }
    const trainee = validated.value;

    return ok(trainee);
  } catch (error) {
    return err({
      message: `トレーニーの登録に失敗しました${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
      status: 500,
    });
  }
};

type RegisterMuscles = (
  props: RegisterMusclesProps
) => Promise<Result<Muscle[], OnboardingError>>;
type RegisterMusclesProps = {
  trainee: Trainee;
  prisma: Transaction;
};
const registerMuscles: RegisterMuscles = async (props) => {
  const muscleNames = Array.from(
    new Set(defaultExercises.flatMap((exercise) => exercise.targetNames))
  );
  const muscles = muscleNames.flatMap((name) => {
    const result = validateMuscle({
      id: ulid(),
      name,
    });

    return result.isErr() ? [] : [result.value];
  });

  try {
    await props.prisma.muscle.createMany({
      data: muscles.map((muscle) => ({
        ...muscle,
        traineeId: props.trainee.id,
      })),
    });

    return ok(muscles);
  } catch (error) {
    return err({
      message: `部位の登録に失敗しました${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
      status: 500,
    });
  }
};

type RegisterExercises = (
  props: RegisterExercisesProps
) => Promise<Result<Exercise[], OnboardingError>>;
type RegisterExercisesProps = {
  trainee: Trainee;
  muscles: Muscle[];
  prisma: Transaction;
};
const registerExercises: RegisterExercises = async (props) => {
  const exercises = defaultExercises.flatMap((exercise) => {
    const result = validateExercise({
      id: ulid(),
      name: exercise.exerciseName,
      targets: exercise.targetNames.flatMap((targetName) => {
        const target = props.muscles.find(
          (muscle) => muscle.name === targetName
        );

        return target ? [target] : [];
      }),
    });

    return result.isErr() ? [] : [result.value];
  });

  try {
    await Promise.all(
      exercises.map(
        async (exercise) =>
          await props.prisma.exercise.create({
            data: {
              id: exercise.id,
              name: exercise.name,
              traineeId: props.trainee.id,
              targets: {
                connect: exercise.targets.map((target) => ({
                  id: target.id,
                })),
              },
            },
          })
      )
    );

    return ok(exercises);
  } catch (error) {
    return err({
      message: `種目の登録に失敗しました${
        error instanceof Error ? `: ${error.message}` : ""
      }`,
      status: 500,
    });
  }
};
