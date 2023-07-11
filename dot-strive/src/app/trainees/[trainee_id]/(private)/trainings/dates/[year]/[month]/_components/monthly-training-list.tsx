import Link from "next/link";

import { utcDateStringSchema } from "@/app/_schemas/utc-date-string";
import { TrainingDetail } from "@/app/trainees/[trainee_id]/(private)/trainings/_components/training-detail";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { TrainingCalendar } from "./training-calendar";
import { getMonthlyTrainings } from "../_repositories/get-monthly-trainings";

import type { FC } from "react";

type Props = {
  traineeId: string;
  year: string;
  month: string;
};
export const MonthlyTrainingList: FC<Props> = async (props) => {
  const result = await getMonthlyTrainings({
    traineeId: props.traineeId,
    year: props.year,
    month: props.month,
  });

  if (result.isErr()) {
    return <p>トレーニングデータの取得に失敗しました</p>;
  }
  const trainings = result.value;

  return (
    <div className={stack({ direction: "column" })}>
      <TrainingCalendar
        traineeId={props.traineeId}
        trainings={trainings}
        selected={utcDateStringSchema.parse(
          new Date(`${props.year}-${props.month}-1`).toISOString()
        )}
      />
      <ul className={stack({ direction: "column", gap: 12, p: 4 })}>
        {trainings
          .sort(
            (a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()
          )
          .map((training) => {
            const styles = css({
              border: "1px solid",
            });

            return (
              <li key={training.id} className={styles}>
                <Link
                  href={`/trainees/${props.traineeId}/trainings/${training.id}`}
                >
                  <TrainingDetail training={training} />
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
};
