import { LocalDate } from "@/app/_components/local-date";
import { stack } from "styled-system/patterns";

import { getExerciseRecords } from "../_repositories/get-exercise-records";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseRecords: FC<Props> = async (props) => {
  const getRecordsResult = await getExerciseRecords({
    traineeId: props.traineeId,
    exerciseId: props.exerciseId,
  });
  if (getRecordsResult.isErr()) {
    return <p>記録データの取得に失敗しました</p>;
  }
  const records = getRecordsResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <p>記録</p>
      <ul className={stack({ direction: "column", gap: 4, pl: 4 })}>
        {records.map(({ date, record }, index) => {
          return (
            <div
              className={stack({ direction: "column" })}
              key={`${index}-${date}`}
            >
              <LocalDate utcDateString={date} />
              <ul className={stack({ direction: "column", pl: 4 })}>
                {record.sets.map((set) => {
                  return (
                    <li key={set.id} className={stack({ direction: "column" })}>
                      <p>
                        {set.weight}kg {set.repetition}回
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </ul>
    </div>
  );
};
