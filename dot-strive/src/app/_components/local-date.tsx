"use client";

import type { UTCDateString } from "../_schemas/utc-date-string";
import type { FC } from "react";

type Props = {
  utcDateString: UTCDateString;
};
export const LocalDate: FC<Props> = (props) => {
  const date = new Date(props.utcDateString).toLocaleString("ja", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return <time>{date}</time>;
};
