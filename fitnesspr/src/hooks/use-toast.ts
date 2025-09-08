/**
 * @fileoverview Toast notification system hook for user feedback
 * 
 * This module provides a comprehensive toast notification system using React hooks
 * and state management. It supports multiple toast types, automatic dismissal,
 * and programmatic control for showing user feedback throughout the application.
 * 
 * Features:
 * - Multiple toast variants (success, error, warning, info)
 * - Automatic dismissal with configurable timing
 * - Manual dismissal and updates
 * - Queue management with configurable limits
 * - Persistent state across component renders
 * - Type-safe interfaces with TypeScript
 * 
 * @example
 * ```typescript
 * import { useToast } from '@/hooks/use-toast'
 * 
 * function MyComponent() {
 *   const { toast } = useToast()
 * 
 *   const handleSuccess = () => {
 *     toast({
 *       title: "Success!",
 *       description: "Your workout has been saved.",
 *       variant: "default"
 *     })
 *   }
 * 
 *   const handleError = () => {
 *     toast({
 *       title: "Error",
 *       description: "Failed to save workout. Please try again.",
 *       variant: "destructive"
 *     })
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Save Workout</button>
 *       <button onClick={handleError}>Simulate Error</button>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @version 1.0.0
 */

"use client"

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

/** Maximum number of toasts that can be displayed simultaneously */
const TOAST_LIMIT = 1

/** Delay in milliseconds before automatically removing dismissed toasts */
const TOAST_REMOVE_DELAY = 1000000

/**
 * Extended toast interface with additional properties for management
 * 
 * Combines the base ToastProps with management fields like id,
 * title, description, and action elements for comprehensive
 * toast functionality.
 * 
 * @interface ToasterToast
 */
type ToasterToast = ToastProps & {
  /** Unique identifier for the toast instance */
  id: string
  /** Optional title content for the toast header */
  title?: React.ReactNode
  /** Optional description content for the toast body */
  description?: React.ReactNode
  /** Optional action element (buttons, links) for user interaction */
  action?: ToastActionElement
}

/**
 * Action types for toast state management
 * 
 * Defines the available actions that can be dispatched to
 * modify the toast state through the reducer pattern.
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST", 
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

/** Global counter for generating unique toast IDs */
let count = 0

/**
 * Generates a unique ID for new toast instances
 * 
 * Creates incrementing numeric IDs with overflow protection
 * to ensure uniqueness across the application lifecycle.
 * 
 * @returns Unique string identifier
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

/**
 * Union type for all possible toast actions
 * 
 * Defines the structure of actions that can be dispatched
 * to modify toast state, each with specific payload requirements.
 */
type Action =
  | {
      /** Action to add a new toast to the queue */
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      /** Action to update an existing toast's properties */
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      /** Action to dismiss a toast (start removal process) */
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      /** Action to completely remove a toast from state */
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

/**
 * State interface for the toast system
 * 
 * Maintains the current array of active toasts and provides
 * the foundation for state management operations.
 * 
 * @interface State
 */
interface State {
  /** Array of currently active toast instances */
  toasts: ToasterToast[]
}

/** Map to track timeout handles for automatic toast removal */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Adds a toast to the removal queue with automatic timeout
 * 
 * Schedules a toast for removal after the configured delay period.
 * Prevents duplicate timeouts for the same toast ID and manages
 * cleanup of timeout references.
 * 
 * @param toastId - Unique identifier of the toast to remove
 * 
 * @example
 * ```typescript
 * // Automatically called when a toast is dismissed
 * addToRemoveQueue("toast_123")
 * 
 * // Toast will be removed after TOAST_REMOVE_DELAY milliseconds
 * ```
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

/**
 * Reducer function for managing toast state transitions
 * 
 * Handles all toast state modifications including adding, updating,
 * dismissing, and removing toasts. Implements the reducer pattern
 * for predictable state management.
 * 
 * @param state - Current toast state
 * @param action - Action to perform on the state
 * @returns New state after applying the action
 * 
 * @example
 * ```typescript
 * const newState = reducer(currentState, {
 *   type: "ADD_TOAST",
 *   toast: newToastObject
 * })
 * ```
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Queue specific toast or all toasts for removal
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

/** Array of listener functions for state change notifications */
const listeners: Array<(state: State) => void> = []

/** Global memory state for toast persistence across components */
let memoryState: State = { toasts: [] }

/**
 * Dispatches an action to update the global toast state
 * 
 * Applies the action to the current state using the reducer
 * and notifies all registered listeners of the state change.
 * This enables reactive updates across the application.
 * 
 * @param action - The action to dispatch
 * 
 * @example
 * ```typescript
 * dispatch({
 *   type: "ADD_TOAST",
 *   toast: {
 *     id: "123",
 *     title: "Success",
 *     description: "Operation completed"
 *   }
 * })
 * ```
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

/** Type for toast creation without requiring an ID */
type Toast = Omit<ToasterToast, "id">

/**
 * Creates and displays a new toast notification
 * 
 * The main function for creating toast notifications throughout
 * the application. Automatically generates a unique ID and provides
 * methods for updating and dismissing the toast.
 * 
 * @param props - Toast configuration object
 * @returns Object with toast control methods
 * 
 * @example
 * ```typescript
 * // Basic success toast
 * const myToast = toast({
 *   title: "Success!",
 *   description: "Your data has been saved."
 * })
 * 
 * // Error toast with action
 * toast({
 *   title: "Error",
 *   description: "Failed to save data.",
 *   variant: "destructive",
 *   action: <Button variant="outline">Retry</Button>
 * })
 * 
 * // Update the toast later
 * myToast.update({
 *   title: "Updated",
 *   description: "Status has changed"
 * })
 * 
 * // Dismiss manually
 * myToast.dismiss()
 * ```
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * Custom React hook for toast notification management
 * 
 * Provides access to the toast system state and methods for
 * creating, updating, and dismissing toast notifications.
 * Automatically subscribes to state changes and handles cleanup.
 * 
 * @returns Object containing toast state and control methods
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { toast, toasts, dismiss } = useToast()
 * 
 *   const showSuccess = () => {
 *     toast({
 *       title: "Workout Completed!",
 *       description: "Great job finishing your training session.",
 *       variant: "default"
 *     })
 *   }
 * 
 *   const showError = () => {
 *     toast({
 *       title: "Connection Error",
 *       description: "Unable to sync your progress. Check your internet connection.",
 *       variant: "destructive"
 *     })
 *   }
 * 
 *   const dismissAll = () => {
 *     dismiss() // Dismiss all toasts
 *   }
 * 
 *   return (
 *     <div>
 *       <button onClick={showSuccess}>Show Success</button>
 *       <button onClick={showError}>Show Error</button>
 *       <button onClick={dismissAll}>Clear All</button>
 *       <div>Active toasts: {toasts.length}</div>
 *     </div>
 *   )
 * }
 * ```
 * 
 * @hook
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ 
      type: "DISMISS_TOAST", 
      ...(toastId && { toastId }) 
    }),
  }
}

export { useToast, toast }
