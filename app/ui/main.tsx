import { cn } from "app/libs/shadcn/utils";

import type { ComponentProps, FC, PropsWithChildren } from "react";

type Props = ComponentProps<"main">;

export const Main: FC<PropsWithChildren<Props>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <main className={cn("flex w-full flex-col gap-8", className)} {...props}>
      {children}
    </main>
  );
};
