"use client";

import { endOfDay } from "date-fns";
import Link from "next/link";
import useSWR from "swr";

import { LocalDate } from "@/app/_components/local-date";
import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";
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

  return (
    <ul className={stack({ direction: "column", gap: 12, p: 4 })}>
      {trainings.map((training) => {
        return (
          <li key={training.id}>
            <Link
              href={`/trainees/${props.traineeId}/trainings/${training.id}`}
            >
              <div className={stack({ direction: "column", p: 4 })}>
                <LocalDate utcDateString={training.date} />
                <ul className={stack({ direction: "column", gap: 8, p: 4 })}>
                  {training.records.map((record) => {
                    return (
                      <li
                        key={record.id}
                        className={stack({ direction: "column" })}
                      >
                        <p>{record.exercise.name}</p>
                        <ul
                          className={stack({
                            direction: "column",
                            px: 4,
                          })}
                        >
                          {record.sets.map((set) => {
                            return (
                              <li
                                key={set.id}
                                className={stack({ direction: "row" })}
                              >
                                <p>{set.weight}kg</p>
                                <p>{set.repetition}回</p>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
