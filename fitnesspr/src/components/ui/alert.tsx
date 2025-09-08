/**
 * @fileoverview Alert UI components for notifications and important messages
 * 
 * A comprehensive alert system with title, description, and multiple variants.
 * Designed for accessibility with proper ARIA roles and semantic structure.
 * Supports icons and provides flexible layout options for different message types.
 * 
 * Features:
 * - Accessible design with role="alert" and proper structure
 * - Multiple variants (default, destructive) for different message types
 * - Icon support with automatic positioning and styling
 * - Compound component pattern (Alert, AlertTitle, AlertDescription)
 * - Responsive design with consistent spacing
 * 
 * @example
 * ```tsx
 * // Basic alert with title and description
 * <Alert>
 *   <AlertCircle className="h-4 w-4" />
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>
 *     Your session has expired. Please log in again.
 *   </AlertDescription>
 * </Alert>
 * 
 * // Destructive alert for errors
 * <Alert variant="destructive">
 *   <ExclamationTriangleIcon className="h-4 w-4" />
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>
 *     Something went wrong. Please try again.
 *   </AlertDescription>
 * </Alert>
 * 
 * // Simple alert without icon
 * <Alert>
 *   <AlertTitle>Success</AlertTitle>
 *   <AlertDescription>
 *     Your changes have been saved successfully.
 *   </AlertDescription>
 * </Alert>
 * 
 * // Title only alert
 * <Alert>
 *   <AlertTitle>System Maintenance</AlertTitle>
 * </Alert>
 * ```
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Alert variant styles using class-variance-authority
 * 
 * Defines consistent styling patterns for different alert types:
 * - default: Standard informational styling with subtle background
 * - destructive: Error/warning styling with red accents and borders
 * 
 * All variants include:
 * - Proper spacing for icons and content
 * - Accessible color contrast ratios
 * - Consistent border radius and padding
 * - Icon positioning and sizing utilities
 */
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Main Alert component container
 * 
 * Provides the base structure for alert messages with:
 * - Semantic role="alert" for screen readers
 * - Consistent spacing and layout
 * - Icon positioning support
 * - Variant-based styling
 * 
 * @param className - Additional CSS classes to apply
 * @param variant - Visual style variant (default, destructive)
 * @param props - All other standard HTML div attributes
 * @param ref - Forward ref for accessing the div element
 * 
 * @returns Styled alert container with accessibility features
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

/**
 * AlertTitle component for alert headings
 * 
 * Provides semantic structure and consistent styling for alert titles:
 * - Uses h5 element for proper heading hierarchy
 * - Optimized typography for alert context
 * - Consistent spacing below title
 * - Font weight and tracking for readability
 * 
 * @param className - Additional CSS classes to apply
 * @param props - All other standard HTML heading attributes
 * @param ref - Forward ref for accessing the heading element
 * 
 * @returns Styled alert title with semantic markup
 */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

/**
 * AlertDescription component for alert content
 * 
 * Provides structured content area for alert descriptions:
 * - Optimized text sizing and line height for readability
 * - Support for paragraph content with proper spacing
 * - Consistent styling with alert theme
 * - Flexible content support (text, links, etc.)
 * 
 * @param className - Additional CSS classes to apply
 * @param props - All other standard HTML div attributes
 * @param ref - Forward ref for accessing the div element
 * 
 * @returns Styled alert description area
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }