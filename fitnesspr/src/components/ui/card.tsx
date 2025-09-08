/**
 * @fileoverview Card component collection for content organization.
 * 
 * This module provides a comprehensive set of card components for organizing
 * and presenting content in a structured, visually appealing manner. The card
 * components follow a consistent design system and are fully accessible.
 * 
 * @author FitnessPr Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Main Card container component.
 * 
 * The root container for card content that provides consistent styling,
 * shadows, borders, and spacing. Acts as the foundation for all other
 * card sub-components.
 * 
 * Features:
 * - Consistent rounded corners and shadow
 * - Responsive design support
 * - Theme-aware background and text colors
 * - Accessible semantic structure
 * 
 * @component
 * @example
 * Basic card:
 * ```tsx
 * <Card>
 *   <CardContent>Simple card content</CardContent>
 * </Card>
 * ```
 * 
 * @example
 * Custom styling:
 * ```tsx
 * <Card className="max-w-md mx-auto">
 *   <CardContent>Centered card with max width</CardContent>
 * </Card>
 * ```
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

/**
 * Card header section component.
 * 
 * Container for the card's header content, typically containing the title
 * and description. Provides consistent spacing and layout for header elements.
 * 
 * @component
 * @example
 * Basic header:
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description goes here</CardDescription>
 *   </CardHeader>
 * </Card>
 * ```
 * 
 * @example
 * Custom header layout:
 * ```tsx
 * <CardHeader className="text-center">
 *   <CardTitle>Centered Title</CardTitle>
 * </CardHeader>
 * ```
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * Card title component.
 * 
 * Semantic heading element for card titles with consistent typography.
 * Uses h3 element for proper document structure and accessibility.
 * 
 * @component
 * @example
 * Basic title:
 * ```tsx
 * <CardTitle>User Profile</CardTitle>
 * ```
 * 
 * @example
 * Custom title styling:
 * ```tsx
 * <CardTitle className="text-center text-primary">
 *   Featured Exercise
 * </CardTitle>
 * ```
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * Card description component.
 * 
 * Subtitle or description text that appears below the card title.
 * Uses muted foreground color for visual hierarchy.
 * 
 * @component
 * @example
 * Basic description:
 * ```tsx
 * <CardDescription>
 *   This is a description of the card content
 * </CardDescription>
 * ```
 * 
 * @example
 * Multi-line description:
 * ```tsx
 * <CardDescription>
 *   A comprehensive fitness program designed for beginners.
 *   Includes cardio, strength training, and flexibility exercises.
 * </CardDescription>
 * ```
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * Card content section component.
 * 
 * Main content area of the card with appropriate padding and spacing.
 * This is where the primary card content should be placed.
 * 
 * @component
 * @example
 * Basic content:
 * ```tsx
 * <CardContent>
 *   <p>Main card content goes here</p>
 * </CardContent>
 * ```
 * 
 * @example
 * Form in card content:
 * ```tsx
 * <CardContent>
 *   <form className="space-y-4">
 *     <Input placeholder="Enter your name" />
 *     <Button type="submit">Submit</Button>
 *   </form>
 * </CardContent>
 * ```
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * Card footer section component.
 * 
 * Footer area typically used for actions, buttons, or additional metadata.
 * Includes flex layout for proper alignment of footer elements.
 * 
 * @component
 * @example
 * Footer with buttons:
 * ```tsx
 * <CardFooter>
 *   <Button variant="outline" className="mr-2">Cancel</Button>
 *   <Button>Save Changes</Button>
 * </CardFooter>
 * ```
 * 
 * @example
 * Footer with metadata:
 * ```tsx
 * <CardFooter className="justify-between">
 *   <span className="text-sm text-muted-foreground">
 *     Last updated: 2024-01-01
 *   </span>
 *   <Button size="sm">Edit</Button>
 * </CardFooter>
 * ```
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * Complete Card component example:
 * 
 * @example
 * Full card structure:
 * ```tsx
 * <Card className="w-[350px]">
 *   <CardHeader>
 *     <CardTitle>Workout Session</CardTitle>
 *     <CardDescription>
 *       Upper body strength training session
 *     </CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <div className="space-y-2">
 *       <div className="flex justify-between">
 *         <span>Duration:</span>
 *         <span>45 minutes</span>
 *       </div>
 *       <div className="flex justify-between">
 *         <span>Exercises:</span>
 *         <span>8 exercises</span>
 *       </div>
 *     </div>
 *   </CardContent>
 *   <CardFooter>
 *     <Button className="w-full">Start Workout</Button>
 *   </CardFooter>
 * </Card>
 * ```
 * 
 * @example
 * Profile card:
 * ```tsx
 * <Card>
 *   <CardHeader className="text-center">
 *     <Avatar className="mx-auto mb-2">
 *       <AvatarImage src="/profile.jpg" />
 *     </Avatar>
 *     <CardTitle>John Doe</CardTitle>
 *     <CardDescription>Personal Trainer</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <div className="space-y-2">
 *       <div>📧 john@example.com</div>
 *       <div>📱 (555) 123-4567</div>
 *       <div>🏋️ 5 years experience</div>
 *     </div>
 *   </CardContent>
 *   <CardFooter>
 *     <Button variant="outline" className="w-full">
 *       Contact Trainer
 *     </Button>
 *   </CardFooter>
 * </Card>
 * ```
 */

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
