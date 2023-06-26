import Image from "next/image";

import { getFetcher } from "@/features/http-client/fetcher";
import { getTraineeBySession } from "@/features/trainee/get-by-session";
import { stack } from "styled-system/patterns";

import type { FC } from "react";

export const Trainee: FC = async () => {
  const traineeResult = await getTraineeBySession({
    fetcher: getFetcher(),
  })();

  if (traineeResult.isErr()) {
    return <p>データの検証に失敗しました</p>;
  }

  const trainee = traineeResult.value;

  return (
    <section className={stack({ direction: "column" })}>
      <p>name: {trainee.name}</p>
      <p>id: {trainee.id}</p>
      <Image src={trainee.image} alt={trainee.name} width={500} height={500} />
    </section>
  );
};
