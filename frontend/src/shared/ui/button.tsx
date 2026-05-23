import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand-red text-white hover:bg-red-700",
  secondary: "bg-brand-ink text-white hover:bg-black",
  ghost: "bg-transparent hover:bg-brand-muted",
  outline: "border border-brand-line bg-white hover:border-brand-red",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", ...props }, ref) => (
  <button
    ref={ref}
    className={cn("focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition", variants[variant], className)}
    {...props}
  />
));

Button.displayName = "Button";
