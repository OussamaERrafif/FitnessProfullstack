/**
 * @fileoverview Label UI component for form field labeling and accessibility
 * 
 * A semantic label component built on Radix UI primitives with comprehensive
 * accessibility features. Provides proper form field association, keyboard
 * navigation support, and consistent styling across the application.
 * 
 * Features:
 * - Built on Radix UI Label for accessibility compliance
 * - Automatic form field association via htmlFor or nested elements
 * - Disabled state handling with visual feedback
 * - Peer element state awareness for disabled field styling
 * - Screen reader compatible with proper semantic structure
 * 
 * @example
 * ```tsx
 * // Basic label with form field association
 * <div className="space-y-2">
 *   <Label htmlFor="email">Email Address</Label>
 *   <Input id="email" type="email" />
 * </div>
 * 
 * // Label with required indicator
 * <Label htmlFor="password">
 *   Password <span className="text-red-500">*</span>
 * </Label>
 * <Input id="password" type="password" required />
 * 
 * // Nested label (automatic association)
 * <Label>
 *   <span>Accept Terms</span>
 *   <input type="checkbox" className="ml-2" />
 * </Label>
 * 
 * // Custom styling for different contexts
 * <Label className="text-lg font-bold">
 *   Workout Name
 * </Label>
 * 
 * // Fitness form examples
 * <div className="grid gap-4">
 *   <div>
 *     <Label htmlFor="weight">Current Weight (lbs)</Label>
 *     <Input id="weight" type="number" placeholder="150" />
 *   </div>
 *   
 *   <div>
 *     <Label htmlFor="goal">Fitness Goal</Label>
 *     <Select>
 *       <SelectTrigger id="goal">
 *         <SelectValue placeholder="Select your goal" />
 *       </SelectTrigger>
 *     </Select>
 *   </div>
 * </div>
 * ```
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Label variant styles using class-variance-authority
 * 
 * Defines consistent styling for form labels with:
 * - Optimized text sizing and weight for readability
 * - Proper line height for single-line labels
 * - Disabled state handling for accessibility
 * - Peer element awareness for form field states
 * 
 * The peer-disabled classes provide visual feedback when
 * associated form fields are in disabled state, improving
 * user experience and accessibility compliance.
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Label component for form field labeling and accessibility
 * 
 * A semantic label component that provides:
 * - Proper form field association for screen readers
 * - Keyboard navigation support (clicking label focuses field)
 * - Visual styling consistent with design system
 * - Automatic disabled state handling
 * - Support for both htmlFor and nested element association
 * 
 * Built on Radix UI Label primitive which ensures:
 * - WCAG accessibility compliance
 * - Cross-browser compatibility
 * - Proper ARIA attributes and roles
 * - Screen reader optimization
 * 
 * Association Methods:
 * 1. htmlFor attribute: Links to element with matching id
 * 2. Nested elements: Automatically associates with nested form controls
 * 3. aria-labelledby: Can be referenced by other elements
 * 
 * Common use cases in fitness applications:
 * - Form field labeling (workout name, weight, reps)
 * - Checkbox and radio button labels
 * - Select dropdown labels
 * - File upload labels
 * - Settings and preference labels
 * 
 * @param className - Additional CSS classes for customization
 * @param props - All other Radix UI Label.Root props
 * @param ref - Forward ref to the label element
 * 
 * @returns Accessible label element with consistent styling
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }