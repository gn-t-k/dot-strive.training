import { forwardRef, type ComponentProps } from "react";

import { css } from "styled-system/css";

type Props = ComponentProps<"input">;
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  props,
  forwardedRef
) {
  const styles = css({
    border: "1px solid black",
    w: "full",
  });

  return <input ref={forwardedRef} className={styles} {...props} />;
});
