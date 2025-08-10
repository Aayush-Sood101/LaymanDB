import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

// --- RECTIFIED VARIANTS ---
// The button variants have been hardcoded for a dark theme with hover effects.
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000] focus-visible:ring-[#FFFFFF]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FFFFFF] text-[#000000] hover:bg-[#E5E7EB]",
        destructive:
          "bg-[#DC2626] text-[#FFFFFF] hover:bg-[#B91C1C]",
        outline:
          "border border-[#374151] bg-transparent text-[#F3F4F6] hover:bg-[#1F2937]",
        secondary:
          "bg-[#1F2937] text-[#F3F4F6] hover:bg-[#374151]",
        ghost:
          "text-[#F3F4F6] hover:bg-[#1F2937]",
        link: "text-[#FFFFFF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }