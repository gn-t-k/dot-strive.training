import { LocalDate } from "@/app/_components/local-date";
import { stack } from "styled-system/patterns";

import type { Training } from "@/app/_schemas/training";
import type { FC } from "react";

type Props = {
  training: Training;
};
export const TrainingDetail: FC<Props> = (props) => {
  return (
    <div className={stack({ direction: "column", p: 4 })}>
      <LocalDate utcDateString={props.training.date} />
      <ul className={stack({ direction: "column", gap: 8, p: 4 })}>
        {props.training.records
          .sort((a, b) => a.order - b.order)
          .map((record) => {
            return (
              <li key={record.id} className={stack({ direction: "column" })}>
                <p>{record.exercise.name}</p>
                <ul
                  className={stack({
                    direction: "column",
                    px: 4,
                  })}
                >
                  {record.sets
                    .sort((a, b) => a.order - b.order)
                    .map((set) => {
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
  );
};
