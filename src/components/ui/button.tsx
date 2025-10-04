import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/35 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-white shadow-[0_4px_12px_rgba(2,6,23,.10)] hover:bg-brand/90 hover:shadow-[0_8px_24px_rgba(2,6,23,.12)]",
        outline: "border border-slate-200 bg-white text-slate-900 hover:bg-white/85",
        ghost: "text-slate-900 hover:bg-slate-50",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-3.5",
        lg: "h-11 px-4",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        ref={ref as any}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
