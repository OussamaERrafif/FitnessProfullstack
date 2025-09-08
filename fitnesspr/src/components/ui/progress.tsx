/**
 * @fileoverview Progress UI component for displaying completion status
 * 
 * A visual progress indicator built on Radix UI primitives with smooth animations
 * and accessibility features. Perfect for showing workout progress, goal completion,
 * loading states, and any percentage-based metrics in the fitness application.
 * 
 * Features:
 * - Built on Radix UI for accessibility and keyboard navigation
 * - Smooth CSS transitions for progress changes
 * - Support for values from 0-100 (percentage)
 * - Responsive design that works on all screen sizes
 * - Customizable styling while maintaining design consistency
 * 
 * @example
 * ```tsx
 * // Basic progress bar for workout completion
 * <Progress value={75} />
 * 
 * // Goal progress with custom styling
 * <Progress 
 *   value={45} 
 *   className="h-2 bg-gray-100" 
 * />
 * 
 * // Dynamic progress with state
 * const [progress, setProgress] = useState(0);
 * 
 * useEffect(() => {
 *   const timer = setTimeout(() => setProgress(66), 500);
 *   return () => clearTimeout(timer);
 * }, []);
 * 
 * <Progress value={progress} />
 * 
 * // Fitness-specific examples
 * // Weekly workout goal
 * <div className="space-y-2">
 *   <div className="flex justify-between">
 *     <span>Weekly Goal</span>
 *     <span>3/5 workouts</span>
 *   </div>
 *   <Progress value={60} />
 * </div>
 * 
 * // Calorie burn progress
 * <div className="space-y-2">
 *   <div className="flex justify-between">
 *     <span>Calories Burned</span>
 *     <span>850/1200 kcal</span>
 *   </div>
 *   <Progress value={71} className="h-3" />
 * </div>
 * ```
 */

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

/**
 * Progress component for displaying completion status and metrics
 * 
 * A versatile progress indicator that provides:
 * - Visual feedback for completion status (0-100%)
 * - Smooth animations when progress values change
 * - Accessibility features including ARIA attributes
 * - Responsive design that adapts to container width
 * - Consistent styling with the design system
 * 
 * Built on Radix UI Progress primitive which provides:
 * - Screen reader support with proper ARIA roles
 * - Keyboard navigation capabilities
 * - Cross-browser compatibility
 * - Semantic HTML structure
 * 
 * Common use cases in fitness applications:
 * - Workout completion tracking
 * - Goal achievement visualization
 * - Daily/weekly/monthly progress metrics
 * - Exercise set completion
 * - Nutrition target progress
 * - Membership or subscription progress
 * 
 * @param className - Additional CSS classes for customization
 * @param value - Progress value as percentage (0-100)
 * @param props - All other Radix UI Progress.Root props
 * @param ref - Forward ref to the root progress element
 * 
 * @returns Accessible progress bar with smooth animations
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
