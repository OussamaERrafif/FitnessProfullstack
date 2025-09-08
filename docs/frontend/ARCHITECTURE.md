# Frontend Architecture Documentation

## Overview

The FitnessPr frontend is built using **Next.js 15** with the App Router, **React 19**, and **TypeScript**. It follows modern React patterns with a component-driven architecture, comprehensive type safety, and responsive design principles.

## Project Structure

```
fitnesspr/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/             # Marketing pages group
│   │   │   ├── page.tsx             # Landing page
│   │   │   ├── about/               # About page
│   │   │   ├── pricing/             # Pricing page
│   │   │   └── contact/             # Contact page
│   │   ├── trainer/                 # Trainer dashboard
│   │   │   ├── layout.tsx           # Trainer layout wrapper
│   │   │   ├── page.tsx             # Trainer dashboard home
│   │   │   ├── clients/             # Client management pages
│   │   │   ├── programs/            # Program management pages
│   │   │   ├── exercises/           # Exercise library pages
│   │   │   ├── meals/               # Meal planning pages
│   │   │   ├── progress/            # Progress tracking pages
│   │   │   ├── payments/            # Payment management pages
│   │   │   └── settings/            # Trainer settings pages
│   │   ├── client/                  # Client interface
│   │   │   ├── [pin]/               # PIN-based client access
│   │   │   ├── pin-login/           # PIN login page
│   │   │   ├── profile/             # Client profile pages
│   │   │   ├── workouts/            # Assigned workouts
│   │   │   ├── nutrition/           # Nutrition plans
│   │   │   └── progress/            # Progress tracking
│   │   ├── api/                     # API routes
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   ├── clients/             # Client API routes
│   │   │   ├── trainers/            # Trainer API routes
│   │   │   └── integration/         # Integration tests
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Root page (landing)
│   │   ├── loading.tsx              # Global loading UI
│   │   ├── error.tsx                # Global error UI
│   │   ├── not-found.tsx            # 404 page
│   │   ├── offline.tsx              # Offline page
│   │   ├── timeout.tsx              # Timeout page
│   │   └── maintenance.tsx          # Maintenance page
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── input.tsx            # Input component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── dialog.tsx           # Dialog/Modal component
│   │   │   ├── form.tsx             # Form components
│   │   │   ├── table.tsx            # Table component
│   │   │   └── ...                  # Other UI primitives
│   │   ├── trainer/                 # Trainer-specific components
│   │   │   ├── layout-client.tsx    # Trainer layout wrapper
│   │   │   ├── trainer-header.tsx   # Header component
│   │   │   ├── trainer-sidebar.tsx  # Sidebar navigation
│   │   │   ├── mobile-menu.tsx      # Mobile navigation
│   │   │   ├── sidebar-context.tsx  # Sidebar state management
│   │   │   └── index.ts             # Component exports
│   │   ├── error-boundary.tsx       # Error boundary component
│   │   └── error-test.tsx           # Error testing component
│   ├── lib/                         # Utility libraries
│   │   ├── utils.ts                 # General utilities
│   │   ├── auth.ts                  # Authentication utilities
│   │   ├── api.ts                   # API client configuration
│   │   ├── validation.ts            # Form validation schemas
│   │   └── constants.ts             # Application constants
│   ├── types/                       # TypeScript type definitions
│   │   ├── auth.ts                  # Authentication types
│   │   ├── user.ts                  # User-related types
│   │   ├── trainer.ts               # Trainer-specific types
│   │   ├── client.ts                # Client-specific types
│   │   ├── exercise.ts              # Exercise types
│   │   ├── program.ts               # Program types
│   │   ├── meal.ts                  # Meal/nutrition types
│   │   ├── progress.ts              # Progress tracking types
│   │   ├── payment.ts               # Payment types
│   │   ├── errors.ts                # Error handling types
│   │   └── api.ts                   # API response types
│   └── hooks/                       # Custom React hooks
│       ├── use-auth.ts              # Authentication hook
│       ├── use-api.ts               # API interaction hook
│       ├── use-local-storage.ts     # Local storage hook
│       ├── use-debounce.ts          # Debouncing hook
│       └── use-media-query.ts       # Responsive design hook
├── public/                          # Static assets
│   ├── images/                      # Image assets
│   ├── icons/                       # Icon files
│   └── manifest.json               # PWA manifest
├── prisma/                          # Database schema (if using Prisma)
│   ├── schema.prisma               # Database schema definition
│   └── migrations/                 # Database migrations
├── docs/                           # Component documentation
│   └── error-handling.md           # Error handling guide
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies and scripts
└── Dockerfile                      # Container configuration
```

## Architecture Patterns

### 1. Component-Driven Development

The application is built using a component-driven approach:

- **Atomic Design**: Components are organized from atoms to organisms
- **Reusability**: Common UI patterns are extracted into reusable components
- **Composition**: Complex interfaces are built by composing simpler components

### 2. App Router Architecture

Next.js 15 App Router provides:

- **File-based Routing**: Routes defined by directory structure
- **Layout Components**: Shared layouts for different sections
- **Server Components**: Optimized server-side rendering by default
- **Streaming**: Progressive page loading with Suspense boundaries

### 3. State Management

- **Server State**: Next.js server components and API routes
- **Client State**: React hooks (useState, useReducer, useContext)
- **Form State**: React Hook Form for complex form handling
- **URL State**: Next.js router for navigation state

## Component Architecture

### UI Component Hierarchy

```
Layout Components
├── RootLayout (app/layout.tsx)
├── TrainerLayout (app/trainer/layout.tsx)
└── ClientLayout (client-specific layouts)

Page Components
├── Landing Page (app/page.tsx)
├── Trainer Dashboard (app/trainer/page.tsx)
├── Client Dashboard (app/client/[pin]/page.tsx)
└── Feature Pages (specific functionality)

Composite Components
├── TrainerHeader (navigation header)
├── TrainerSidebar (navigation sidebar)
├── ClientWorkoutCard (workout display)
└── ProgressChart (data visualization)

UI Primitives
├── Button (clickable actions)
├── Input (form inputs)
├── Card (content containers)
├── Dialog (modals and overlays)
└── Table (data display)
```

### Component Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Props Interface**: Well-defined TypeScript interfaces for all props
3. **Accessibility**: WCAG 2.2 AA compliance for all interactive elements
4. **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
5. **Error Boundaries**: Graceful error handling at component level

## Authentication Architecture

### Dual Authentication System

1. **Trainer Authentication**: Traditional email/password with JWT tokens
2. **Client Authentication**: PIN-based access for simplified client experience

### Authentication Flow

```typescript
// Trainer Login Flow
User enters credentials → 
Validate against backend → 
Receive JWT token → 
Store in secure storage → 
Include in API requests

// Client PIN Flow
Client enters PIN → 
Validate PIN against backend → 
Receive temporary session → 
Access client-specific content
```

### Security Considerations

- **JWT Storage**: Secure token storage with httpOnly cookies
- **Token Refresh**: Automatic token refresh for seamless experience
- **Route Protection**: Protected routes with authentication guards
- **PIN Security**: Time-limited PIN access with rate limiting

## Data Flow Architecture

### API Integration

```typescript
// API Client Structure
class ApiClient {
  private baseURL: string
  private authToken?: string
  
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data: any): Promise<T>
  async put<T>(endpoint: string, data: any): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

### Data Fetching Patterns

1. **Server Components**: Fetch data at build time or request time
2. **Client Components**: Use custom hooks for client-side data fetching
3. **API Routes**: Next.js API routes for backend integration
4. **Caching**: Automatic caching with Next.js cache optimization

## Styling Architecture

### Design System

Built with **Tailwind CSS** and **shadcn/ui**:

```scss
// Design Tokens
:root {
  // Colors
  --primary: 220 13% 91%;
  --primary-foreground: 220 100% 5%;
  
  // Typography
  --font-family-base: 'Geist', system-ui, sans-serif;
  --font-family-mono: 'Geist Mono', 'Courier New', monospace;
  
  // Spacing
  --spacing-unit: 0.25rem; // 4px base unit
  
  // Breakpoints
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### Component Styling Strategy

1. **Utility-First**: Tailwind CSS for rapid development
2. **Component Variants**: Consistent styling with class variance authority
3. **Responsive Design**: Mobile-first with progressive enhancement
4. **Dark Mode Support**: Built-in dark mode with CSS variables

## Type Safety

### TypeScript Integration

- **Strict Configuration**: Strict TypeScript settings for maximum safety
- **API Types**: Shared types between frontend and backend
- **Component Props**: Comprehensive prop type definitions
- **Form Validation**: Type-safe form schemas with Zod

### Type Definition Examples

```typescript
// User Types
interface User {
  id: string
  email: string
  name: string
  role: 'trainer' | 'client'
  createdAt: Date
  updatedAt: Date
}

// API Response Types
interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

// Component Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}
```

## Performance Optimization

### Next.js Optimizations

- **Image Optimization**: Next.js Image component with automatic optimization
- **Code Splitting**: Automatic code splitting with dynamic imports
- **Server Components**: Reduced client-side JavaScript bundle
- **Streaming**: Progressive page loading with Suspense

### Client-Side Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive computations
- **Debouncing**: Input debouncing for search and API calls
- **Virtual Scrolling**: For large lists and data tables

## Error Handling

### Error Boundary Strategy

```typescript
// Global Error Boundary
class GlobalErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service
    console.error('Global error:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

### Error Recovery

- **Graceful Degradation**: Fallback UI for component failures
- **Retry Mechanisms**: Automatic retry for transient errors
- **User Feedback**: Clear error messages with recovery actions
- **Offline Support**: Offline-first approach with service worker

## Testing Strategy

### Testing Approach

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: End-to-end testing with Playwright
- **Type Checking**: Continuous TypeScript validation
- **Linting**: ESLint for code quality and consistency

### Testing Tools

- **Jest**: Unit test runner
- **React Testing Library**: Component testing utilities
- **Playwright**: End-to-end testing framework
- **MSW**: API mocking for testing

## Development Workflow

### Code Quality

- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit validation
- **TypeScript**: Strict type checking

### Build Process

```bash
# Development
npm run dev          # Start development server
npm run lint         # Run linting
npm run type-check   # TypeScript validation

# Production
npm run build        # Production build
npm run start        # Start production server
npm run analyze      # Bundle analysis
```

## Deployment Architecture

### Build Optimization

- **Static Export**: Pre-rendered static pages where possible
- **Edge Runtime**: Edge functions for dynamic content
- **CDN Integration**: Optimized asset delivery
- **Progressive Web App**: PWA features for mobile experience

### Environment Configuration

```typescript
// Environment Variables
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  environment: process.env.NODE_ENV,
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
}
```

## Future Enhancements

- **Real-time Features**: WebSocket integration for live updates
- **Offline Support**: Enhanced PWA capabilities with offline functionality
- **Micro-frontends**: Modular architecture for team scalability
- **Advanced Analytics**: User behavior tracking and performance monitoring
- **Internationalization**: Multi-language support with next-intl
- **Native Mobile**: React Native integration for mobile apps