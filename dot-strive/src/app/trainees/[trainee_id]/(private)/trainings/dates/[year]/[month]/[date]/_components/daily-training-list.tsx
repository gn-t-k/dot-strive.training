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
  try {
    const startOfDate = new Date(`${props.year}-${props.month}-${props.date}`);
    const endOfDate = endOfDay(startOfDate);

    return (
      <DailyTrainingListView
        traineeId={props.traineeId}
        startOfDate={startOfDate}
        endOfDate={endOfDate}
      />
    );
  } catch (error) {
    return (
      <section>
        <h1>エラーが発生しました</h1>
        <ul>
          <li>
            message: {error instanceof Error ? error.message : "unknown error"}
          </li>
          <li>year: {props.year}</li>
          <li>month: {props.month}</li>
          <li>date: {props.date}</li>
        </ul>
      </section>
    );
  }
};

type ViewProps = {
  traineeId: string;
  startOfDate: Date;
  endOfDate: Date;
};
const DailyTrainingListView: FC<ViewProps> = (props) => {
  const { data: trainings } = useSWR(
    `/api/trainees/${props.traineeId}/trainings/dates/${encodeURIComponent(
      props.startOfDate.toISOString()
    )}/${encodeURIComponent(props.endOfDate.toISOString())}`,
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
    },
    {
      suspense: true,
      fallbackData: [],
    }
  );

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
