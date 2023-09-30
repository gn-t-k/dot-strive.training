import { getTrainingById } from "@/app/_actions/get-training-by-id";
import { getVolume, type Training } from "@/app/_schemas/training";
import { stack } from "styled-system/patterns";

import { LocalDate } from "./local-date";

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
  if (getTrainingResult.isErr) {
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
      <div className={stack({ direction: "row" })}>
        <LocalDate utcDateString={props.training.date} />
        <p>ボリューム: {getVolume(props.training)}kg</p>
      </div>
      <ul className={stack({ direction: "column", gap: 8, p: 4 })}>
        {props.training.records.map((record) => {
          return (
            <li key={record.id} className={stack({ direction: "column" })}>
              <p>{record.exercise.name}</p>
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
