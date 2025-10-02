import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-[0_4px_12px_rgba(2,6,23,.10)] hover:shadow-[0_8px_24px_rgba(2,6,23,.12)] hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2",
        outline:
          "border border-slate-200 bg-white text-slate-900 hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2",
        ghost:
          "text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-3.5",
        lg: "h-11 px-4",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref as any}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
