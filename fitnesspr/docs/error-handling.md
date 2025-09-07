# Error Handling System

This document describes the comprehensive error handling system implemented in the FitnessPr application.

## Overview

The error handling system provides:
- ✅ Consistent error pages across all routes
- ✅ Context-aware error messages (trainer vs client)
- ✅ Development-friendly debugging information
- ✅ Error reporting and analytics
- ✅ Recovery suggestions and actions
- ✅ Offline support and graceful degradation

## Error Pages Hierarchy

### Global Error Pages
Located in `src/app/`

1. **`error.tsx`** - Catches JavaScript errors in any page
2. **`not-found.tsx`** - Handles 404 errors site-wide  
3. **`global-error.tsx`** - Catches errors in root layout
4. **`offline.tsx`** - Shows when app is offline
5. **`access-denied.tsx`** - Handles 403/unauthorized access
6. **`maintenance.tsx`** - Maintenance mode page
7. **`timeout.tsx`** - Session timeout page

### Context-Specific Error Pages
Located in route-specific folders

#### Trainer Section (`src/app/trainer/`)
- **`error.tsx`** - Trainer-specific error handling
- **`not-found.tsx`** - Trainer pages not found

#### Client Section (`src/app/client/`)
- **`error.tsx`** - Client-specific error handling  
- **`not-found.tsx`** - Client pages not found with PIN context

## Error Types and Handling

### Client-Side Errors

**JavaScript Runtime Errors**
- Caught by `error.tsx` boundaries
- Automatic error reporting
- User-friendly recovery options

**Network Errors**
- API request failures
- Connection timeouts
- Offline detection

**Authentication Errors**
- Invalid PIN codes
- Session expiration
- Permission denied

### Server-Side Errors

**API Route Errors**
- Handled by `api-error-handler.ts`
- Standardized error responses
- Proper HTTP status codes

**Database Errors**
- Prisma error mapping
- Connection failures
- Constraint violations

**Validation Errors**
- Zod schema validation
- Type safety enforcement
- Field-level error messages

## Key Features

### 🎨 Context-Aware Design
- **Trainer errors**: Blue theme, dashboard-focused recovery
- **Client errors**: Green theme, PIN-focused recovery  
- **Payment errors**: Purple theme, billing-focused recovery
- **Auth errors**: Yellow theme, login-focused recovery

### 🔄 Recovery Actions
Each error page provides relevant recovery options:
- Try again / Refresh
- Go to appropriate home page
- Contact support with context
- Access offline features

### 🧪 Development Support
- Detailed error messages in development
- Stack traces and error IDs
- Component stack information
- Breadcrumb tracking

### 📊 Error Reporting
- Automatic error logging
- Context metadata collection
- User agent and session info
- Analytics integration ready

## Usage Examples

### Error Boundary Usage
```tsx
import { ErrorBoundary } from '@/components/error-boundary'

export function TrainerDashboard() {
  return (
    <ErrorBoundary context="trainer">
      <DashboardContent />
    </ErrorBoundary>
  )
}
```

### API Error Handling
```tsx
import { withErrorHandling, ValidationError } from '@/lib/api-error-handler'

export const POST = withErrorHandling(async (req: NextRequest) => {
  const data = await validateRequest(req, CreateClientSchema)
  
  if (!data.pin) {
    throw new ValidationError('PIN is required')
  }
  
  // ... handle request
})
```

### Custom Error Pages
```tsx
// Route-specific error page
export default function ClientError({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      context="client"
      error={error}
      onRetry={reset}
      recoveryActions={[
        { label: 'Try again', action: reset },
        { label: 'Back to login', href: '/client/pin-login' }
      ]}
    />
  )
}
```

## File Structure

```
src/
├── app/
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx            # Global 404 page
│   ├── global-error.tsx         # Root layout errors
│   ├── offline.tsx              # Offline page
│   ├── access-denied.tsx        # 403 page
│   ├── maintenance.tsx          # Maintenance page
│   ├── timeout.tsx              # Session timeout
│   ├── trainer/
│   │   ├── error.tsx            # Trainer errors
│   │   └── not-found.tsx        # Trainer 404
│   └── client/
│       ├── error.tsx            # Client errors
│       └── not-found.tsx        # Client 404
├── components/
│   └── error-boundary.tsx       # React Error Boundary
├── lib/
│   ├── error-utils.ts           # Error utilities
│   └── api-error-handler.ts     # API error handling
└── types/
    └── errors.ts                # Error type definitions
```

## Error States by Route

### `/trainer/*` Routes
- **Not Found**: Shows trainer-specific navigation
- **Errors**: Blue theme, preserves trainer context
- **Recovery**: Links to dashboard, client management

### `/client/*` Routes  
- **Not Found**: PIN-focused messaging
- **Errors**: Green theme, emphasizes data safety
- **Recovery**: Links to PIN login, trainer contact

### API Routes (`/api/*`)
- **Validation**: Zod error mapping
- **Database**: Prisma error handling
- **Auth**: JWT/session validation
- **Rate Limiting**: Request throttling

## Testing Error Pages

Use the development error triggers:
```tsx
// Trigger JavaScript error
throw new Error('Test error')

// Trigger validation error  
throw new ValidationError('Invalid data')

// Trigger network error
fetch('/api/nonexistent')

// Trigger auth error
throw new AuthenticationError('Invalid session')
```

## Analytics Integration

Error events tracked:
- Error type and context
- User journey breadcrumbs  
- Recovery action success
- Error frequency patterns
- Performance impact

## Accessibility

All error pages include:
- ✅ High contrast error indicators
- ✅ Screen reader announcements
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Clear action labels

## Performance

Error pages are optimized for:
- ✅ Fast loading during failures
- ✅ Minimal JavaScript requirements
- ✅ Offline functionality
- ✅ Low memory footprint

## Security

Error handling includes:
- ✅ No sensitive data exposure
- ✅ Safe error message sanitization
- ✅ Rate limiting for error endpoints
- ✅ Secure error reporting

## Maintenance

Regular maintenance tasks:
- Review error frequency reports
- Update error messages based on user feedback
- Test error recovery flows
- Monitor error reporting accuracy
- Update offline capabilities
