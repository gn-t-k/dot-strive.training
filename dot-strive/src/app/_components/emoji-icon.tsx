import { css } from "styled-system/css";

import type { FC } from "react";

type Props = {
  emoji: string;
  label: string;
  size: Size;
};
type Size = "small" | "medium";
export const EmojiIcon: FC<Props> = (props) => {
  return (
    <span
      aria-label={props.label}
      className={css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        w: props.size === "small" ? 8 : 12,
        h: props.size === "small" ? 8 : 12,
        fontSize: props.size === "small" ? 24 : 32,
      })}
    >
      {props.emoji}
    </span>
  );
};
