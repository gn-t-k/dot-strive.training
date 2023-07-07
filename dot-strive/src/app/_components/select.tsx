import { forwardRef } from "react";

import { css } from "styled-system/css";

import type { ComponentProps } from "react";

type Props = ComponentProps<"select">;
export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  props,
  forwardedRef
) {
  const styles = css({
    border: "1px solid black",
  });

  return <select ref={forwardedRef} className={styles} {...props} />;
});
