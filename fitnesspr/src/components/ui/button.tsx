/**
 * @fileoverview Button component built with Radix UI primitives and CVA variants.
 * 
 * This component provides a versatile button implementation with multiple variants,
 * sizes, and styling options. It's built on top of Radix UI's Slot component for
 * composition flexibility and uses class-variance-authority for variant management.
 * 
 * @author FitnessPr Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Button variant styles using class-variance-authority.
 * 
 * Defines consistent styling patterns for different button states and sizes
 * with built-in accessibility features including focus management, disabled
 * states, and proper contrast ratios.
 * 
 * Variants:
 * - default: Primary button with brand colors
 * - destructive: Warning/danger actions (red theme)
 * - outline: Subtle button with border
 * - secondary: Secondary actions (grey theme)
 * - ghost: Minimal button without background
 * - link: Text button with underline on hover
 * 
 * Sizes:
 * - default: Standard button height (40px)
 * - sm: Small button (36px)
 * - lg: Large button (44px)
 * - icon: Square button for icons (40x40px)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Props interface for the Button component.
 * 
 * Extends native HTML button attributes and includes variant-specific props
 * from class-variance-authority for type-safe styling options.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as a child component instead of a button element.
   * When true, the button will render as a Radix Slot component,
   * allowing for composition with other components while maintaining
   * button styling and behavior.
   * 
   * @default false
   * 
   * @example
   * ```tsx
   * <Button asChild>
   *   <Link href="/dashboard">Dashboard</Link>
   * </Button>
   * ```
   */
  asChild?: boolean
}

/**
 * Versatile Button component with multiple variants and sizes.
 * 
 * This component provides a comprehensive button implementation built on
 * Radix UI primitives with Tailwind CSS styling. It supports multiple
 * visual variants, sizes, and can be composed with other components.
 * 
 * Features:
 * - Multiple visual variants (primary, destructive, outline, etc.)
 * - Different sizes (small, default, large, icon)
 * - Full accessibility support (WCAG 2.2 AA compliant)
 * - Keyboard navigation and focus management
 * - Disabled state handling
 * - Composition support via asChild prop
 * - TypeScript support with proper type inference
 * - Consistent theming with CSS custom properties
 * 
 * @component
 * @example
 * Basic usage:
 * ```tsx
 * <Button>Click me</Button>
 * ```
 * 
 * @example
 * Different variants:
 * ```tsx
 * <Button variant="default">Primary Action</Button>
 * <Button variant="destructive">Delete Item</Button>
 * <Button variant="outline">Cancel</Button>
 * <Button variant="ghost">Secondary Action</Button>
 * ```
 * 
 * @example
 * Different sizes:
 * ```tsx
 * <Button size="sm">Small Button</Button>
 * <Button size="default">Default Button</Button>
 * <Button size="lg">Large Button</Button>
 * <Button size="icon"><Icon /></Button>
 * ```
 * 
 * @example
 * Composition with other components:
 * ```tsx
 * <Button asChild>
 *   <Link href="/profile">View Profile</Link>
 * </Button>
 * ```
 * 
 * @example
 * Custom styling:
 * ```tsx
 * <Button className="w-full" variant="outline">
 *   Full Width Button
 * </Button>
 * ```
 * 
 * @example
 * Event handling:
 * ```tsx
 * <Button 
 *   onClick={() => console.log('Clicked!')}
 *   disabled={isLoading}
 * >
 *   {isLoading ? 'Loading...' : 'Submit'}
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
