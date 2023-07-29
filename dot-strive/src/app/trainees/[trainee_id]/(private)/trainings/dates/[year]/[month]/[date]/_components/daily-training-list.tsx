import Link from "next/link";

import { TrainingDetailView } from "@/app/trainees/[trainee_id]/(private)/trainings/_components/training-detail";
import { stack } from "styled-system/patterns";

import { getDailyTrainings } from "../_repository/get-daily-trainings";

import type { FC } from "react";

type Props = {
  traineeId: string;
  year: string;
  month: string;
  date: string;
};
export const DailyTrainingList: FC<Props> = async (props) => {
  const result = await getDailyTrainings({
    traineeId: props.traineeId,
    year: props.year,
    month: props.month,
    date: props.date,
  });
  if (result.isErr()) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = result.value;

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
