import Image from "next/image";

import { getTraineeBySession } from "@/app/_actions/get-trainee-by-session";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import type { FC } from "react";

export const Trainee: FC = async () => {
  const traineeResult = await getTraineeBySession();

  if (traineeResult.isErr) {
    return <p>データの検証に失敗しました</p>;
  }

  const trainee = traineeResult.value;

  return (
    <section
      className={stack({
        direction: "column",
        align: "center",
      })}
    >
      <Image
        src={trainee.image}
        alt={trainee.name}
        width={48}
        height={48}
        className={css({ borderRadius: "50%" })}
      />
      <h1>{trainee.name}</h1>
      <p>id: {trainee.id}</p>
    </section>
  );
};
