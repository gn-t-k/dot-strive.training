import { Root } from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

import { cn } from "app/libs/shadcn/utils";

import type { VariantProps } from "class-variance-authority";

const labelVariants = cva(
  "text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

const Label = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = Root.displayName;

export { Label };
