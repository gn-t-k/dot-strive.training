import { center } from "styled-system/patterns";

import type { FC } from "react";

type Props = {
  description: string;
};
export const Loading: FC<Props> = (props) => {
  return (
    <div className={center()}>
      <p>{props.description}</p>
    </div>
  );
};
