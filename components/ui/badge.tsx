import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent text-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",

        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",

        outline:
          "border-border bg-transparent text-foreground hover:bg-secondary",

        ghost:
          "text-muted-foreground hover:bg-secondary hover:text-foreground",

        destructive:
          "bg-destructive text-white hover:bg-destructive/90",

        link:
          "text-primary underline-offset-4 hover:underline",
      },

      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-7",
        xs: "h-7 px-2.5 text-xs",
        icon: "size-10",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
