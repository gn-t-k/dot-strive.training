import { type FC } from "react";

import { stack } from "styled-system/patterns";

import type { Muscle } from "@/app/_schemas/muscle";

type Props = {
  muscle: Muscle;
};
export const MuscleDetail: FC<Props> = async (props) => {
  return (
    <div className={stack({ direction: "column" })}>
      <p>{props.muscle.name}</p>
    </div>
  );
};
