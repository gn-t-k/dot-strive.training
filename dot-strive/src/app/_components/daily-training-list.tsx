import { addMinutes, endOfDay, startOfDay } from "date-fns";
import Link from "next/link";

import { prisma } from "@/app/_libs/prisma/client";
import { stack } from "styled-system/patterns";

import { validateTraining } from "../_schemas/training";
import { TrainingDetailView } from "../trainees/[trainee_id]/(private)/trainings/_components/training-detail";

import type { TraineeId } from "../_schemas/trainee";
import type { UTCDateString } from "../_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  traineeId: TraineeId;
  date: UTCDateString;
  timezoneOffset: number;
};
export const DailyTrainingList: FC<Props> = async (props) => {
  const startOfDate = startOfDay(new Date(props.date));
  const endOfDate = endOfDay(startOfDate);
  const offsetStartOfDate = addMinutes(startOfDate, props.timezoneOffset);
  const offsetEndOfDate = addMinutes(endOfDate, props.timezoneOffset);

  const data = await prisma.trainee.findUnique({
    where: {
      id: props.traineeId,
    },
    include: {
      trainings: {
        where: {
          date: {
            gte: offsetStartOfDate,
            lte: offsetEndOfDate,
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

  if (!data) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }

  const trainings = data.trainings.flatMap((training) => {
    const result = validateTraining({
      ...training,
      date: training.date.toISOString(),
    });

    return result.isErr() ? [] : [result.value];
  });

  return (
    <ul className={stack({ direction: "column", gap: 12, p: 4 })}>
      {trainings.map((training) => {
        return (
          <li key={training.id}>
            <Link
              href={`/trainees/${props.traineeId}/trainings/${training.id}`}
            >
              <TrainingDetailView training={training} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
