import Link from "next/link";

import { getVolume, type Training } from "@/app/_schemas/training";
import { stack } from "styled-system/patterns";

import { LocalDate } from "./local-date";

import type { FC } from "react";

type TrainingDetailProps = {
  training: Training;
  traineeId: string;
};
export const TrainingDetail: FC<TrainingDetailProps> = (props) => {
  return (
    <div className={stack({ direction: "column", p: 4 })}>
      <div className={stack({ direction: "row" })}>
        <LocalDate utcDateString={props.training.date} />
        <p>ボリューム: {getVolume(props.training)}kg</p>
      </div>
      <ul className={stack({ direction: "column", gap: 8, p: 4 })}>
        {props.training.records.map((record) => {
          return (
            <li key={record.id} className={stack({ direction: "column" })}>
              <Link
                href={`/trainees/${props.traineeId}/exercises/${record.exercise.id}`}
              >
                {record.exercise.name}
              </Link>
              <ul
                className={stack({
                  direction: "column",
                  px: 4,
                })}
              >
                {record.sets.map((set) => {
                  return (
                    <li key={set.id} className={stack({ direction: "row" })}>
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
  );
};
