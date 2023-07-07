"use client";

import * as T from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState } from "react";

import { css } from "styled-system/css";
import { center } from "styled-system/patterns";

import type { FC, PropsWithChildren } from "react";

type ToastContextType = {
  renderToast: RenderToast;
};
type RenderToast = (props: { title: string; variant: Variant }) => void;
type Variant = "success" | "error";
const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
  const [variant, setVariant] = useState<Variant>("success");
  const [title, setTitle] = useState("");
  const [isToastOpen, setIsToastOpen] = useState(false);
  const renderToast = useCallback<RenderToast>((props) => {
    setVariant(props.variant);
    setTitle(props.title);
    setIsToastOpen(true);
  }, []);

  const Toast: FC = () => (
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

  return (
    <ToastContext.Provider value={{ renderToast }}>
      {children}
      <Toast />
    </ToastContext.Provider>
  );
};

type UseToast = () => ToastContextType;
export const useToast: UseToast = () => {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
