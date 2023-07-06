import { forwardRef } from "react";

import { css } from "styled-system/css";

import type { ComponentProps } from "react";

type Props = ComponentProps<"textarea">;
export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  function Textarea(props, forwardedRef) {
    const styles = css({
      border: "1px solid black",
    });

    return <textarea ref={forwardedRef} className={styles} {...props} />;
  }
);
