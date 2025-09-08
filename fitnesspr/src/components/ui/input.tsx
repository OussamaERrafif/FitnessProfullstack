/**
 * @fileoverview Input UI component for forms and user input
 * 
 * A flexible and accessible input component built on top of HTML input element
 * with consistent styling, focus management, and full React.InputHTMLAttributes support.
 * 
 * Features:
 * - Full accessibility support with proper focus indicators
 * - Consistent styling across the application
 * - Support for all native HTML input types
 * - Disabled state handling
 * - File input styling optimization
 * - Forward ref support for form libraries
 * 
 * @example
 * ```tsx
 * // Basic text input
 * <Input type="text" placeholder="Enter your name" />
 * 
 * // Email input with validation
 * <Input 
 *   type="email" 
 *   placeholder="user@example.com"
 *   required 
 * />
 * 
 * // Password input
 * <Input 
 *   type="password" 
 *   placeholder="••••••••"
 *   minLength={8}
 * />
 * 
 * // Disabled input
 * <Input 
 *   type="text" 
 *   value="Read only"
 *   disabled 
 * />
 * 
 * // Custom styling
 * <Input 
 *   className="border-red-500" 
 *   type="text"
 *   placeholder="Error state"
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Props interface for the Input component
 * 
 * Extends all standard HTML input attributes including:
 * - type: Input type (text, email, password, number, etc.)
 * - placeholder: Placeholder text
 * - value/defaultValue: Input value
 * - onChange: Change event handler
 * - disabled: Disabled state
 * - required: Required validation
 * - All other standard HTML input attributes
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input component for forms and user input
 * 
 * A versatile input component that provides:
 * - Consistent visual styling across the application
 * - Proper focus management with ring indicators
 * - Disabled state styling with reduced opacity
 * - File input optimizations for better UX
 * - Responsive design that works on all screen sizes
 * 
 * @param className - Additional CSS classes to apply
 * @param type - HTML input type (text, email, password, etc.)
 * @param props - All other standard HTML input attributes
 * @param ref - Forward ref for accessing the input element
 * 
 * @returns Styled input element with consistent design system
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
