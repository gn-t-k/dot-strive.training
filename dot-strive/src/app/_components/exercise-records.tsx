import { getRecordsByExerciseId } from "@/app/_actions/get-records-by-exercise-id";
import { LocalDate } from "@/app/_components/local-date";
import { stack } from "styled-system/patterns";

import { getEstimatedMaximumWeight } from "../_schemas/training";

import type { FC } from "react";

type Props = {
  traineeId: string;
  exerciseId: string;
};
export const ExerciseRecords: FC<Props> = async (props) => {
  const getRecordsResult = await getRecordsByExerciseId({
    traineeId: props.traineeId,
    exerciseId: props.exerciseId,
    take: 10,
  });
  if (getRecordsResult.isErr) {
    return <p>記録データの取得に失敗しました</p>;
  }
  const trainings = getRecordsResult.value;

  return (
    <div className={stack({ direction: "column" })}>
      <p>記録</p>
      <ul className={stack({ direction: "column", gap: 4, pl: 4 })}>
        {trainings.map((training, index) => {
          return (
            <div
              className={stack({ direction: "column" })}
              key={`${index}-${training.date}`}
            >
              <LocalDate utcDateString={training.date} />
              <ul className={stack({ direction: "column", pl: 4 })}>
                {training.records
                  .flatMap((record) => record.sets)
                  .map((set) => {
                    return (
                      <li
                        key={set.id}
                        className={stack({ direction: "column" })}
                      >
                        <p>
                          {set.weight}kg {set.repetition}回（推定1RM:{" "}
                          {getEstimatedMaximumWeight({
                            weight: set.weight,
                            repetition: set.repetition,
                          })}
                          ）
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
