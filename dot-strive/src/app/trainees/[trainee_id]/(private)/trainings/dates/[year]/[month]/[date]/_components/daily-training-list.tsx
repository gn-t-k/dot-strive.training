"use client";

import { endOfDay } from "date-fns";
import Link from "next/link";
import useSWR from "swr";

import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { TrainingDetailView } from "@/app/trainees/[trainee_id]/(private)/trainings/_components/training-detail";
import { stack } from "styled-system/patterns";

import type { FC } from "react";

type Props = {
  traineeId: string;
  year: string;
  month: string;
  date: string;
};
export const DailyTrainingList: FC<Props> = (props) => {
  const startOfDate = new Date(`${props.year}-${props.month}-${props.date}`);
  const endOfDate = endOfDay(startOfDate);

  const {
    data: trainings,
    isLoading,
    error,
  } = useSWR(
    `/api/trainees/${props.traineeId}/trainings/dates/${encodeURIComponent(
      startOfDate.toISOString()
    )}/${encodeURIComponent(endOfDate.toISOString())}`,
    async (key) => {
      const response = await getFetcher()(key);
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("トレーニングデータの取得に失敗しました");
      }
      const trainings = data.flatMap((training) => {
        const result = validateTraining(training);

        return result.isErr() ? [] : [result.value];
      });

      return trainings;
    }
  );

  if (isLoading) {
    return <p>トレーニングデータを取得しています</p>;
  }

  if (!trainings || !!error) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }

  // const result = await getDailyTrainings({
  //   traineeId: props.traineeId,
  //   year: props.year,
  //   month: props.month,
  //   date: props.date,
  // });

  // if (result.isErr()) {
  //   return <p>トレーニングデータの取得に失敗しました</p>;
  // }
  // const trainings = result.value;

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
