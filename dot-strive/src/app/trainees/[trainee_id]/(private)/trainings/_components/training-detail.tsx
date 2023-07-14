import { LocalDate } from "@/app/_components/local-date";
import { stack } from "styled-system/patterns";

import { getTrainingById } from "../[training_id]/_repositories/get-training-by-id";

import type { Training } from "@/app/_schemas/training";
import type { FC } from "react";

type Props = {
  traineeId: string;
  trainingId: string;
};
export const TrainingDetail: FC<Props> = async (props) => {
  const getTrainingResult = await getTrainingById({
    traineeId: props.traineeId,
    trainingId: props.trainingId,
  });
  if (getTrainingResult.isErr()) {
    return <p>データの取得に失敗しました</p>;
  }
  const training = getTrainingResult.value;

  return <TrainingDetailView training={training} />;
};

type TrainingDetailViewProps = {
  training: Training;
};
export const TrainingDetailView: FC<TrainingDetailViewProps> = (props) => {
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
