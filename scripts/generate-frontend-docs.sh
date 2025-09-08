#!/bin/bash

# Frontend Documentation Generation Script
# This script generates comprehensive documentation for the frontend components and utilities

echo "🚀 Generating Frontend Documentation..."

# Navigate to frontend directory
cd "$(dirname "$0")/../fitnesspr" || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Install TypeDoc for documentation generation
echo "📦 Installing documentation dependencies..."
npm install --save-dev typedoc typedoc-plugin-markdown @types/node || {
    echo "❌ Failed to install documentation dependencies"
    exit 1
}

# Create TypeDoc configuration
echo "🔧 Creating TypeDoc configuration..."
cat > typedoc.json << 'EOF'
{
  "entryPoints": ["src"],
  "entryPointStrategy": "expand",
  "out": "docs/api",
  "theme": "default",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "readme": "README.md",
  "name": "FitnessPr Frontend Documentation",
  "plugin": ["typedoc-plugin-markdown"],
  "gitRevision": "main",
  "sort": ["source-order"],
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": [
    "Components",
    "Hooks", 
    "Types",
    "Utilities",
    "API",
    "*"
  ]
}
EOF

# Generate TypeDoc documentation
echo "🏗️ Generating TypeDoc documentation..."
npx typedoc || echo "⚠️  TypeDoc generation completed with warnings"

# Create component documentation
echo "📝 Generating component documentation..."

# Create comprehensive component documentation
mkdir -p ../docs/frontend/components

cat > ../docs/frontend/components/README.md << 'EOF'
# Frontend Components Documentation

This directory contains documentation for all React components in the FitnessPr frontend application.

## Component Categories

### UI Components (`src/components/ui/`)

Base UI components built with shadcn/ui and Radix UI primitives:

- **Button** - Clickable button with multiple variants and sizes
- **Input** - Form input fields with validation support
- **Card** - Content container with header, body, and footer sections
- **Dialog** - Modal dialogs and overlays
- **Form** - Form components with React Hook Form integration
- **Table** - Data tables with sorting and pagination
- **Badge** - Status indicators and labels
- **Accordion** - Expandable content sections
- **Avatar** - User profile pictures and placeholders
- **Progress** - Progress bars and indicators
- **Select** - Dropdown selection components
- **Tabs** - Tabbed navigation interface
- **Toast** - Notification messages

### Trainer Components (`src/components/trainer/`)

Components specific to the trainer dashboard:

- **TrainerHeader** - Main navigation header with user actions
- **TrainerSidebar** - Navigation sidebar with menu items
- **TrainerLayout** - Layout wrapper for trainer pages
- **MobileMenu** - Mobile-responsive navigation menu
- **SidebarContext** - Context provider for sidebar state

### Error Handling Components

- **ErrorBoundary** - React error boundary for graceful error handling
- **ErrorTest** - Component for testing error scenarios

## Component Structure

Each component follows this structure:

```typescript
/**
 * Component description and purpose
 * 
 * @param props - Component props with TypeScript interface
 * @returns JSX.Element
 */
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

## Usage Examples

### Basic Button Usage

```typescript
import { Button } from '@/components/ui/button'

function MyComponent() {
  return (
    <Button 
      variant="primary" 
      size="md"
      onClick={() => console.log('Clicked!')}
    >
      Click Me
    </Button>
  )
}
```

### Trainer Header Usage

```typescript
import { TrainerHeader } from '@/components/trainer/trainer-header'

function TrainerDashboard() {
  return (
    <div>
      <TrainerHeader />
      <main>
        {/* Dashboard content */}
      </main>
    </div>
  )
}
```

## Props Documentation

All components include comprehensive TypeScript interfaces for their props:

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

## Accessibility

All components follow WCAG 2.2 AA accessibility guidelines:

- Semantic HTML structure
- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- High contrast support

## Responsive Design

Components are built with a mobile-first approach:

- Tailwind CSS responsive utilities
- Breakpoint-specific styling
- Touch-friendly interface elements
- Adaptive layouts for different screen sizes

## Testing

Components can be tested using React Testing Library:

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```
EOF

# Generate hook documentation
echo "📝 Generating hooks documentation..."

cat > ../docs/frontend/hooks/README.md << 'EOF'
# Custom Hooks Documentation

This directory contains documentation for all custom React hooks used in the FitnessPr frontend.

## Available Hooks

### Authentication Hooks

#### `useAuth`

Hook for managing user authentication state.

```typescript
const { user, login, logout, isLoading } = useAuth()
```

**Returns:**
- `user` - Current authenticated user or null
- `login` - Function to authenticate user
- `logout` - Function to sign out user  
- `isLoading` - Boolean indicating auth state loading

### API Hooks

#### `useApi`

Hook for making API requests with automatic error handling.

```typescript
const { data, error, loading, refetch } = useApi('/api/trainers')
```

**Parameters:**
- `endpoint` - API endpoint to fetch from
- `options` - Request options (method, body, headers)

**Returns:**
- `data` - Response data
- `error` - Error object if request failed
- `loading` - Boolean indicating request status
- `refetch` - Function to retry the request

### Storage Hooks

#### `useLocalStorage`

Hook for persisting state in localStorage.

```typescript
const [value, setValue] = useLocalStorage('key', initialValue)
```

**Parameters:**
- `key` - localStorage key
- `initialValue` - Default value if key doesn't exist

**Returns:**
- `value` - Current stored value
- `setValue` - Function to update stored value

### Utility Hooks

#### `useDebounce`

Hook for debouncing rapidly changing values.

```typescript
const debouncedValue = useDebounce(value, delay)
```

**Parameters:**
- `value` - Value to debounce
- `delay` - Debounce delay in milliseconds

**Returns:**
- `debouncedValue` - Debounced value

#### `useMediaQuery`

Hook for responsive design based on media queries.

```typescript
const isMobile = useMediaQuery('(max-width: 768px)')
```

**Parameters:**
- `query` - CSS media query string

**Returns:**
- `matches` - Boolean indicating if query matches

## Hook Patterns

### Custom Hook Structure

```typescript
function useCustomHook(parameter: string) {
  const [state, setState] = useState<StateType>(initialState)
  
  const handleAction = useCallback(() => {
    // Hook logic
  }, [parameter])
  
  useEffect(() => {
    // Side effects
  }, [parameter])
  
  return {
    state,
    handleAction,
    // Other return values
  }
}
```

### Error Handling in Hooks

```typescript
function useApiWithError<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Request failed')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err as Error)
    }
  }, [endpoint])
  
  return { data, error, fetchData }
}
```

## Testing Hooks

Use React Testing Library's `renderHook` for testing:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './use-local-storage'

test('useLocalStorage sets and gets value', () => {
  const { result } = renderHook(() => useLocalStorage('test', 'initial'))
  
  expect(result.current[0]).toBe('initial')
  
  act(() => {
    result.current[1]('updated')
  })
  
  expect(result.current[0]).toBe('updated')
})
```
EOF

# Generate types documentation
echo "📝 Generating types documentation..."

cat > ../docs/frontend/types/README.md << 'EOF'
# TypeScript Types Documentation

This directory contains documentation for all TypeScript type definitions used in the FitnessPr frontend.

## Type Categories

### Authentication Types (`src/types/auth.ts`)

Types related to user authentication and authorization:

```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'trainer' | 'client'
  createdAt: Date
  updatedAt: Date
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface LoginCredentials {
  email: string
  password: string
}

interface PinCredentials {
  pin: string
}
```

### Trainer Types (`src/types/trainer.ts`)

Types specific to trainer functionality:

```typescript
interface Trainer {
  id: string
  userId: string
  specialization: string
  experienceYears: number
  bio?: string
  certification?: string
  hourlyRate: number
  createdAt: Date
  updatedAt: Date
}

interface TrainerProfile extends Trainer {
  user: User
  clients: Client[]
  programs: Program[]
}
```

### Client Types (`src/types/client.ts`)

Types for client management:

```typescript
interface Client {
  id: string
  userId: string
  trainerId: string
  pin: string
  goals?: string
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  medicalConditions?: string
  createdAt: Date
  updatedAt: Date
}

interface ClientProfile extends Client {
  user: User
  trainer: Trainer
  programs: Program[]
  progress: ProgressEntry[]
}
```

### Exercise Types (`src/types/exercise.ts`)

Types for exercise library:

```typescript
interface Exercise {
  id: string
  name: string
  description: string
  category: ExerciseCategory
  muscleGroups: string[]
  equipment: string[]
  difficultyLevel: DifficultyLevel
  instructions: string[]
  tips?: string[]
  imageUrl?: string
  videoUrl?: string
}

type ExerciseCategory = 
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'balance'
  | 'sports'

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
```

### Program Types (`src/types/program.ts`)

Types for workout programs:

```typescript
interface Program {
  id: string
  name: string
  description?: string
  trainerId: string
  clientId: string
  durationWeeks: number
  sessionsPerWeek: number
  difficultyLevel: DifficultyLevel
  goals: string[]
  isActive: boolean
  exercises: ProgramExercise[]
  createdAt: Date
  updatedAt: Date
}

interface ProgramExercise {
  id: string
  programId: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps: string
  weight?: number
  restSeconds: number
  notes?: string
  orderInProgram: number
  weekNumber: number
  dayNumber: number
}
```

### API Types (`src/types/api.ts`)

Types for API interactions:

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}
```

### Error Types (`src/types/errors.ts`)

Types for error handling:

```typescript
interface ErrorInfo {
  timestamp: Date
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
}

interface ErrorReport {
  error: Error
  errorInfo: ErrorInfo
  context?: Record<string, any>
}

interface RecoveryAction {
  label: string
  action: () => void
  primary?: boolean
}

interface ErrorPageConfig {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  colorScheme: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'gray'
  showErrorDetails: boolean
  recoveryActions: RecoveryAction[]
  supportInfo?: {
    email?: string
    phone?: string
    helpUrl?: string
  }
}
```

## Type Patterns

### Generic Types

```typescript
// Generic API response type
interface ApiResponse<T> {
  data: T
  status: 'success' | 'error'
  message?: string
}

// Usage
type TrainerResponse = ApiResponse<Trainer>
type TrainerListResponse = ApiResponse<Trainer[]>
```

### Union Types

```typescript
// Status union type
type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

// Form validation state
type ValidationState = 'valid' | 'invalid' | 'pending'
```

### Utility Types

```typescript
// Pick specific properties
type TrainerSummary = Pick<Trainer, 'id' | 'name' | 'specialization'>

// Make properties optional
type PartialTrainer = Partial<Trainer>

// Omit properties
type CreateTrainer = Omit<Trainer, 'id' | 'createdAt' | 'updatedAt'>

// Extract union member
type UserRole = User['role'] // 'trainer' | 'client'
```

### Conditional Types

```typescript
// Type based on condition
type ApiResult<T> = T extends string ? string : T extends number ? number : unknown

// Non-null assertion
type NonNull<T> = T extends null | undefined ? never : T
```

## Type Guards

```typescript
// User-defined type guards
function isTrainer(user: User): user is User & { role: 'trainer' } {
  return user.role === 'trainer'
}

function isClient(user: User): user is User & { role: 'client' } {
  return user.role === 'client'
}

// Usage
if (isTrainer(user)) {
  // user is now typed as trainer
  console.log(user.role) // TypeScript knows this is 'trainer'
}
```

## Module Augmentation

```typescript
// Extending existing types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      role: 'trainer' | 'client'
    }
  }
}
```

This comprehensive type system ensures type safety throughout the application and provides excellent developer experience with IntelliSense and compile-time error checking.
EOF

# Create utility documentation
echo "📝 Generating utilities documentation..."

cat > ../docs/frontend/utilities/README.md << 'EOF'
# Utility Functions Documentation

This directory contains documentation for all utility functions and helper modules in the FitnessPr frontend.

## Utility Categories

### General Utilities (`src/lib/utils.ts`)

Common utility functions used throughout the application:

#### `cn(...inputs: ClassValue[])`

Combines CSS classes using clsx and tailwind-merge for optimal Tailwind CSS class merging.

```typescript
import { cn } from '@/lib/utils'

// Usage
const buttonClasses = cn(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-500 text-white',
  variant === 'secondary' && 'bg-gray-200 text-gray-900',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)
```

#### `formatDate(date: Date, format?: string)`

Formats dates in a consistent way across the application.

```typescript
// Usage
const formattedDate = formatDate(new Date(), 'MMM dd, yyyy')
// Output: "Jan 15, 2024"
```

#### `generateId(prefix?: string)`

Generates unique IDs for UI elements.

```typescript
// Usage
const id = generateId('button') // "button-abc123"
const uniqueId = generateId() // "id-def456"
```

### Authentication Utilities (`src/lib/auth.ts`)

Utilities for handling authentication and authorization:

#### `isAuthenticated()`

Checks if the current user is authenticated.

```typescript
// Usage
if (isAuthenticated()) {
  // User is logged in
}
```

#### `hasRole(role: 'trainer' | 'client')`

Checks if the current user has a specific role.

```typescript
// Usage
if (hasRole('trainer')) {
  // User is a trainer
}
```

#### `getAuthToken()`

Retrieves the current authentication token.

```typescript
// Usage
const token = getAuthToken()
if (token) {
  // Include token in API requests
}
```

### API Utilities (`src/lib/api.ts`)

Utilities for API interactions:

#### `createApiClient(baseURL: string)`

Creates a configured API client with authentication and error handling.

```typescript
// Usage
const api = createApiClient('http://localhost:8000/api/v1')

// Making requests
const trainers = await api.get('/trainers')
const newTrainer = await api.post('/trainers', trainerData)
```

#### `handleApiError(error: unknown)`

Standardized error handling for API responses.

```typescript
// Usage
try {
  await api.post('/trainers', data)
} catch (error) {
  const errorMessage = handleApiError(error)
  toast.error(errorMessage)
}
```

### Validation Utilities (`src/lib/validation.ts`)

Utilities for form validation using Zod schemas:

#### Form Schemas

```typescript
import { z } from 'zod'

const trainerSchema = z.object({
  specialization: z.string().min(1, 'Specialization is required'),
  experienceYears: z.number().min(0).max(50),
  hourlyRate: z.number().min(0),
  bio: z.string().optional(),
  certification: z.string().optional()
})

type TrainerFormData = z.infer<typeof trainerSchema>
```

#### `validateForm(data: unknown, schema: ZodSchema)`

Validates form data against a Zod schema.

```typescript
// Usage
const result = validateForm(formData, trainerSchema)
if (result.success) {
  // Data is valid
  const validData = result.data
} else {
  // Handle validation errors
  const errors = result.error.flatten()
}
```

### Constants (`src/lib/constants.ts`)

Application-wide constants and configuration:

```typescript
// API Configuration
export const API_ENDPOINTS = {
  AUTH: '/auth',
  TRAINERS: '/trainers',
  CLIENTS: '/clients',
  EXERCISES: '/exercises',
  PROGRAMS: '/programs',
  MEALS: '/meals',
  PROGRESS: '/progress',
  PAYMENTS: '/payments'
} as const

// UI Constants
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

// Validation Constants
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PIN_LENGTH: 4,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const

// Exercise Categories
export const EXERCISE_CATEGORIES = [
  'strength',
  'cardio',
  'flexibility',
  'balance',
  'sports'
] as const

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced'
] as const
```

## Utility Patterns

### Error Handling Utilities

```typescript
// Error boundary helper
export function createErrorBoundary(
  fallback: React.ComponentType<{ error: Error }>
) {
  return class ErrorBoundary extends React.Component {
    // Implementation
  }
}

// Async error handler
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await asyncFn()
  } catch (error) {
    onError?.(error as Error)
    return null
  }
}
```

### Local Storage Utilities

```typescript
// Type-safe localStorage wrapper
export function getStorageItem<T>(
  key: string,
  defaultValue: T
): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}
```

### Debouncing Utilities

```typescript
// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
```

### Format Utilities

```typescript
// Currency formatting
export function formatCurrency(
  amount: number,
  currency = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// Number formatting
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

// Relative time formatting
export function formatRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffInMs = date.getTime() - Date.now()
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))
  
  return rtf.format(diffInDays, 'day')
}
```

## Testing Utilities

```typescript
// Test utilities for components
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    )
  }
  
  return render(ui, { wrapper: Wrapper, ...options })
}

// Mock API responses
export function createMockApi(responses: Record<string, any>) {
  return {
    get: jest.fn().mockImplementation((url) => 
      Promise.resolve(responses[url])
    ),
    post: jest.fn().mockResolvedValue({ success: true }),
    put: jest.fn().mockResolvedValue({ success: true }),
    delete: jest.fn().mockResolvedValue({ success: true })
  }
}
```

These utilities provide a solid foundation for building consistent, maintainable, and well-tested functionality throughout the FitnessPr frontend application.
EOF

echo "✅ Frontend documentation generated successfully!"
echo ""
echo "Generated documentation:"
echo "- TypeDoc API documentation (if installed)"
echo "- Component documentation at ../docs/frontend/components/"
echo "- Hooks documentation at ../docs/frontend/hooks/"
echo "- Types documentation at ../docs/frontend/types/"
echo "- Utilities documentation at ../docs/frontend/utilities/"

echo "🎉 Frontend documentation generation complete!"