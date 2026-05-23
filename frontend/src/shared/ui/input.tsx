import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/shared/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("focus-ring h-11 w-full rounded-md border border-brand-line bg-white px-3 text-sm transition placeholder:text-zinc-400", className)}
    {...props}
  />
));

Input.displayName = "Input";
