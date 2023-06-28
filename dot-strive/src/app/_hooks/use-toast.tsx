"use client";

import * as T from "@radix-ui/react-toast";
import { useCallback, useState } from "react";

import { css } from "styled-system/css";
import { center } from "styled-system/patterns";

type UseToast = () => {
  Toast: () => JSX.Element;
  renderToast: RenderToast;
};
type RenderToast = (props: { title: string; variant: Variant }) => void;
type Variant = "success" | "error";
export const useToast: UseToast = () => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [variant, setVariant] = useState<Variant>("success");
  const renderToast = useCallback<RenderToast>((props) => {
    setVariant(props.variant);
    setTitle(props.title);
    setIsToastOpen(true);
  }, []);

  const Toast = (): JSX.Element => (
    <T.Provider>
      <T.Root
        open={isToastOpen}
        onOpenChange={setIsToastOpen}
        className={css({
          width: "390px",
          height: "35px",
          borderWidth: "1px",
          borderColor: variant === "success" ? "green" : "red",
          borderStyle: "solid",
        })}
      >
        <T.Title className={center()}>{title}</T.Title>
      </T.Root>
      <T.Viewport
        className={css({
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
        })}
      />
    </T.Provider>
  );

  return {
    Toast,
    renderToast,
  };
};
