/**
 * @fileoverview Utility functions for the FitnessPr application
 * 
 * This module contains commonly used utility functions for styling,
 * formatting, validation, and data manipulation throughout the application.
 * These utilities provide consistent behavior and reduce code duplication.
 * 
 * Categories:
 * - Styling: CSS class name utilities with Tailwind CSS
 * - Formatting: Date, currency, and number formatting
 * - Validation: Input validation and data verification
 * - Generation: PIN generation and unique identifiers
 * 
 * @example
 * ```typescript
 * import { cn, formatDate, formatCurrency, generatePin } from '@/lib/utils'
 * 
 * // Combine CSS classes conditionally
 * const buttonClass = cn(
 *   'base-button',
 *   isActive && 'active',
 *   variant === 'primary' && 'primary-button'
 * )
 * 
 * // Format dates and currency consistently
 * const formattedDate = formatDate(new Date())
 * const price = formatCurrency(29.99)
 * 
 * // Generate secure PINs
 * const clientPin = generatePin()
 * ```
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines CSS class names with Tailwind CSS conflict resolution
 * 
 * This utility combines multiple class names and resolves Tailwind CSS
 * conflicts by ensuring that later classes override earlier ones when
 * they target the same CSS property. Essential for conditional styling.
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays)
 * @returns Merged and optimized class name string
 * 
 * @example
 * ```typescript
 * // Basic usage
 * cn('btn', 'btn-primary') // 'btn btn-primary'
 * 
 * // Conditional classes
 * cn('btn', isActive && 'btn-active') // 'btn' or 'btn btn-active'
 * 
 * // Tailwind conflict resolution
 * cn('p-4', 'p-2') // 'p-2' (later class wins)
 * 
 * // Complex conditional styling
 * cn(
 *   'base-button',
 *   {
 *     'bg-blue-500': variant === 'primary',
 *     'bg-red-500': variant === 'danger',
 *     'opacity-50': disabled
 *   },
 *   className // External className prop
 * )
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date object into a human-readable string
 * 
 * Provides consistent date formatting throughout the application
 * using the Intl.DateTimeFormat API for proper internationalization
 * support and locale-aware formatting.
 * 
 * @param date - The date object to format
 * @returns Formatted date string (e.g., "January 15, 2024")
 * 
 * @example
 * ```typescript
 * const today = new Date()
 * const formatted = formatDate(today) // "January 15, 2024"
 * 
 * // Use in components
 * <span>Session Date: {formatDate(session.date)}</span>
 * 
 * // Progress log timestamps
 * const logDate = formatDate(progressLog.createdAt)
 * ```
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * Formats a number as currency with proper locale formatting
 * 
 * Converts numeric amounts to properly formatted currency strings
 * with the appropriate currency symbol, decimal places, and
 * thousands separators for consistent financial displays.
 * 
 * @param amount - The numeric amount to format (in base currency units)
 * @returns Formatted currency string (e.g., "$29.99")
 * 
 * @example
 * ```typescript
 * const price = formatCurrency(29.99) // "$29.99"
 * const sessionCost = formatCurrency(75) // "$75.00"
 * 
 * // Payment amounts (stored in cents, convert to dollars)
 * const paymentAmount = formatCurrency(payment.amount / 100)
 * 
 * // Trainer hourly rates
 * const hourlyRate = formatCurrency(trainer.hourlyRate / 100)
 * 
 * // Use in components
 * <div>Total: {formatCurrency(totalAmount)}</div>
 * ```
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

/**
 * Generates a secure 6-digit PIN for client identification
 * 
 * Creates a random 6-digit numeric PIN for quick client lookup
 * and identification. Ensures the PIN is always 6 digits by
 * adding a minimum value to prevent leading zeros.
 * 
 * @returns A 6-digit PIN string
 * 
 * @example
 * ```typescript
 * const clientPin = generatePin() // "123456"
 * 
 * // Create new client with PIN
 * const newClient = {
 *   name: "John Doe",
 *   pin: generatePin(),
 *   trainerId: currentTrainer.id
 * }
 * 
 * // Display PIN to trainer
 * console.log(`Client PIN: ${generatePin()}`)
 * ```
 */
export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Validates that a PIN meets the required format
 * 
 * Checks if a given string is a valid 6-digit PIN by verifying
 * it contains exactly 6 numeric digits with no other characters.
 * Used for client PIN validation and input verification.
 * 
 * @param pin - The PIN string to validate
 * @returns True if the PIN is valid, false otherwise
 * 
 * @example
 * ```typescript
 * validatePin("123456") // true
 * validatePin("12345")  // false (too short)
 * validatePin("1234567") // false (too long)
 * validatePin("12345a") // false (contains letter)
 * validatePin("abc123") // false (contains letters)
 * 
 * // Use in form validation
 * const handlePinSubmit = (pin: string) => {
 *   if (!validatePin(pin)) {
 *     setError("PIN must be exactly 6 digits")
 *     return
 *   }
 *   // Process valid PIN
 * }
 * 
 * // Client lookup validation
 * if (validatePin(inputPin)) {
 *   const client = await findClientByPin(inputPin)
 * }
 * ```
 */
export function validatePin(pin: string): boolean {
  return /^\d{6}$/.test(pin)
}
