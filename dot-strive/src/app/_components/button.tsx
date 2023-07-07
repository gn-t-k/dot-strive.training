import { forwardRef } from "react";

import { cva } from "styled-system/css";

import type { ComponentProps } from "react";

type Props = {
  visual?: Visual;
  size?: Size;
} & ComponentProps<"button">;
type Visual = "positive" | "negative" | "neutral";
type Size = "large" | "default";
export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { visual = "neutral", size = "default", ...props },
  forwardedRef
) {
  const styles = cva({
    base: {
      px: "12px",
      cursor: "pointer",
    },
    variants: {
      visual: {
        positive: {
          color: "white",
          bg: "blue",
        },
        negative: {
          color: "white",
          bg: "red",
        },
        neutral: {
          color: "black",
          bg: "white",
          border: "1px solid black",
        },
      },
      size: {
        large: { h: "48px" },
        default: { h: "40px" },
      },
      disabled: {
        true: {
          color: "gray.400",
          bg: "gray.100",
          border: "none",
          cursor: "not-allowed",
        },
      },
    },
  });

  return (
    <button
      ref={forwardedRef}
      className={styles({ visual, size, disabled: props.disabled })}
      {...props}
    />
  );
});
