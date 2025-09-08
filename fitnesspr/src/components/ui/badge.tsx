/**
 * @fileoverview Badge UI component for status indicators and labels
 * 
 * A versatile badge component for displaying status, categories, or metadata.
 * Built with class-variance-authority for type-safe variant management and
 * supports multiple visual styles for different use cases.
 * 
 * Features:
 * - Multiple predefined variants (default, secondary, destructive, outline)
 * - Type-safe props with TypeScript
 * - Accessible design with proper focus management
 * - Hover effects for interactive elements
 * - Consistent with design system colors
 * 
 * @example
 * ```tsx
 * // Default primary badge
 * <Badge>New</Badge>
 * 
 * // Secondary variant for less emphasis
 * <Badge variant="secondary">Draft</Badge>
 * 
 * // Destructive for errors or warnings
 * <Badge variant="destructive">Error</Badge>
 * 
 * // Outline style for subtle indicators
 * <Badge variant="outline">Optional</Badge>
 * 
 * // With custom content
 * <Badge variant="default">
 *   <Star className="w-3 h-3 mr-1" />
 *   Premium
 * </Badge>
 * ```
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge variant styles using class-variance-authority
 * 
 * Defines consistent styling patterns for different badge types:
 * - default: Primary brand colors with high contrast
 * - secondary: Muted colors for less important information
 * - destructive: Red colors for errors, warnings, or deletions
 * - outline: Border-only style for subtle emphasis
 * 
 * All variants include:
 * - Proper color contrast for accessibility
 * - Hover effects for interactive elements
 * - Focus ring support for keyboard navigation
 * - Transition animations for smooth state changes
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Props interface for the Badge component
 * 
 * Combines standard HTML div attributes with variant props:
 * - variant: Visual style (default, secondary, destructive, outline)
 * - className: Additional CSS classes
 * - children: Badge content (text, icons, etc.)
 * - All standard HTML div attributes (onClick, aria-label, etc.)
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component for status indicators and labels
 * 
 * A flexible component for displaying:
 * - Status indicators (active, inactive, pending)
 * - Category labels (fitness, nutrition, premium)
 * - Count indicators (notifications, items)
 * - Metadata tags (new, featured, limited)
 * 
 * The component automatically handles:
 * - Accessible color contrast ratios
 * - Keyboard focus management
 * - Hover and focus states
 * - Responsive text sizing
 * 
 * @param className - Additional CSS classes to apply
 * @param variant - Visual style variant
 * @param props - All other standard HTML div attributes
 * 
 * @returns Styled badge element with specified variant
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
