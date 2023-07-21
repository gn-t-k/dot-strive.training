"use client";

import { type FC } from "react";
import useSWR from "swr";

import { LocalDate } from "@/app/_components/local-date";
import { validateTraining } from "@/app/_schemas/training";
import { getFetcher } from "@/app/_utils/get-fetcher";
import { stack } from "styled-system/patterns";

import type { Record } from "@/app/_schemas/training";
import type { UTCDateString } from "@/app/_schemas/utc-date-string";
import type { Route } from "next";

type ExerciseInformationProps = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseInformation: FC<ExerciseInformationProps> = (props) => {
  const { data } = useSWR<
    {
      date: UTCDateString;
      records: Record[];
    }[]
  >(
    `/api/trainees/${props.traineeId}/trainings/exercises/${props.exerciseId}`,
    async (url: Route) => {
      const response = await getFetcher()(url);
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("種目データの取得に失敗しました");
      }
      const trainings = data.flatMap((training) => {
        const validateTrainingResult = validateTraining(training);

        return validateTrainingResult.isErr()
          ? []
          : [validateTrainingResult.value];
      });

      return trainings.map((training) => {
        return {
          date: training.date,
          records: training.records,
        };
      });
    },
    {
      suspense: true,
    }
  );

  return (
    <ul
      className={stack({
        direction: "column",
      })}
    >
      {data?.map((training) => {
        return (
          <li
            className={stack({ direction: "column", p: 4 })}
            key={training.date}
          >
            <LocalDate utcDateString={training.date} />
            <ul>
              {training.records.map((record) => {
                return (
                  <li
                    key={record.id}
                    className={stack({ direction: "column" })}
                  >
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
          </li>
        );
      })}
    </ul>
  );
};
