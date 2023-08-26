"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/app/_libs/prisma/client";

import { nextAuthOptions } from "../_libs/next-auth/options";
import { validateTrainee, type Trainee } from "../_schemas/trainee";

import type { Route } from "next";

type GetTraineeOrRedirect = () => Promise<Trainee | never>;
export const getTraineeOrRedirect: GetTraineeOrRedirect = async () => {
  const session = await getServerSession(nextAuthOptions);
  const authUserId = session?.user.id;
  if (!authUserId) {
    redirect("/login" satisfies Route);
  }

  const data = await prisma.trainee.findUnique({
    where: {
      authUserId,
    },
  });
  if (!data) {
    redirect("/trainees/onboarding" satisfies Route);
  }

  const result = validateTrainee(data);
  if (result.isErr) {
    redirect("/trainees/onboarding" satisfies Route);
  }
  const trainee = result.value;

  return trainee;
};
