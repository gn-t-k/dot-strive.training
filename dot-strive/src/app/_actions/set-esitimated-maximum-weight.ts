"use server";

import { prisma } from "@/app/_libs/prisma/client";

import { getEstimatedMaximumWeight } from "../_schemas/training";

export const setEstimatedMaximumWeight = async (): Promise<void> => {
  console.info("seed start");

  const sets = await prisma.set.findMany();
  console.info(`got ${sets.length} sets`);

  sets.forEach(async (set) => {
    try {
      const estimatedMaximumWeight = getEstimatedMaximumWeight({
        weight: set.weight,
        repetition: set.repetition,
      });
      await prisma.set.update({
        where: {
          id: set.id,
        },
        data: {
          estimatedMaximumWeight,
        },
      });

      console.info(`${set.id} updated`);
    } catch (error) {
      console.log({ error });
    }
  });
};
