import { css } from "styled-system/css";
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
        const date = new Date(training.date).toLocaleString("ja", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const styles = css({
          border: "1px solid",
        });

        return (
          <li key={training.id} className={styles}>
            <div className={stack({ direction: "column" })}>
              <time>{date}</time>
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
                          gap: 4,
                          p: 4,
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
          </li>
        );
      })}
    </ul>
  );
};
