# RTK Query Integration Guide

This project now includes RTK Query for efficient API data fetching and state management.

## What is RTK Query?

RTK Query is a powerful data fetching and caching solution built on top of Redux Toolkit. It provides:

- **Automatic caching** - Data is cached automatically and shared across components
- **Background refetching** - Keeps data fresh with configurable refetching
- **Loading states** - Built-in loading, error, and success states
- **Optimistic updates** - UI updates immediately, then syncs with server
- **Normalized data** - Automatic normalization and relationship management
- **TypeScript support** - Full type safety for all API operations

## Key Benefits

### Before RTK Query (Old Approach)
```typescript
// Manual loading state management
const [clients, setClients] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState('')

// Manual data fetching
useEffect(() => {
  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const data = await clientsService.getClients()
      setClients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  fetchClients()
}, [])
```

### After RTK Query (New Approach)
```typescript
// Automatic state management
const { data: clients, error, isLoading } = useGetClientsQuery()
```

## Setup

The RTK Query integration is already configured in this project:

1. **Redux Store** - Configured in `src/lib/store/index.ts`
2. **API Slice** - Base API configuration in `src/lib/store/api.ts`
3. **Redux Provider** - App wrapped in `src/app/layout.tsx`
4. **Domain APIs** - Specific APIs like `authApi.ts` and `clientsApi.ts`

## Available APIs

### Authentication API (`authApi.ts`)
```typescript
import { useLoginMutation, useGetCurrentUserQuery } from '@/lib/store/authApi'

// Login mutation
const [login, { isLoading }] = useLoginMutation()

// Get current user
const { data: user, error, isLoading } = useGetCurrentUserQuery()
```

### Clients API (`clientsApi.ts`)
```typescript
import { 
  useGetClientsQuery, 
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation 
} from '@/lib/store/clientsApi'

// Fetch clients
const { data: clients, error, isLoading, refetch } = useGetClientsQuery()

// Create client
const [createClient, { isLoading: isCreating }] = useCreateClientMutation()

// Update client
const [updateClient] = useUpdateClientMutation()

// Delete client
const [deleteClient] = useDeleteClientMutation()
```

## Usage Examples

### 1. Fetching Data (Query)

```typescript
'use client'
import { useGetClientsQuery } from '@/lib/store/clientsApi'

export function ClientsList() {
  const { 
    data: clients,     // The actual data
    error,            // Any error that occurred
    isLoading,        // Loading state
    refetch          // Function to manually refetch
  } = useGetClientsQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {clients?.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  )
}
```

### 2. Creating Data (Mutation)

```typescript
'use client'
import { useCreateClientMutation } from '@/lib/store/clientsApi'

export function CreateClientForm() {
  const [createClient, { isLoading, error }] = useCreateClientMutation()

  const handleSubmit = async (formData) => {
    try {
      const result = await createClient(formData).unwrap()
      console.log('Client created:', result)
      // The clients list will automatically update due to cache invalidation
    } catch (err) {
      console.error('Failed to create client:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Client'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </form>
  )
}
```

### 3. Updating Data

```typescript
'use client'
import { useUpdateClientMutation } from '@/lib/store/clientsApi'

export function EditClient({ client }) {
  const [updateClient, { isLoading }] = useUpdateClientMutation()

  const handleUpdate = async (updates) => {
    try {
      await updateClient({ id: client.id, ...updates }).unwrap()
      // Cache automatically updates
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  return (
    // Update form component
  )
}
```

## Cache Management

RTK Query automatically manages the cache:

- **Automatic Invalidation** - When you create/update/delete, related queries are invalidated
- **Background Refetching** - Data refetches when you focus the window or reconnect
- **Deduplication** - Multiple components requesting the same data share one request

### Tags System
Our API uses tags for cache invalidation:

```typescript
// When creating a client, invalidate the clients list
createClient: builder.mutation({
  // ...
  invalidatesTags: [{ type: 'Client', id: 'LIST' }],
})

// Clients list provides tags for cache management
getClients: builder.query({
  // ...
  providesTags: (result) =>
    result
      ? [
          ...result.map(({ id }) => ({ type: 'Client', id })),
          { type: 'Client', id: 'LIST' },
        ]
      : [{ type: 'Client', id: 'LIST' }],
})
```

## Migration Guide

To migrate from the old service pattern to RTK Query:

### 1. Replace Service Imports
```typescript
// Old
import { clientsService } from '@/lib/clients-service'

// New
import { useGetClientsQuery, useCreateClientMutation } from '@/lib/store/clientsApi'
```

### 2. Replace Manual State Management
```typescript
// Old
const [data, setData] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState('')

// New
const { data, isLoading, error } = useGetClientsQuery()
```

### 3. Replace Manual API Calls
```typescript
// Old
const handleCreate = async () => {
  setIsLoading(true)
  try {
    const result = await clientsService.createClient(data)
    // Manual cache invalidation
    refetchClients()
  } catch (err) {
    setError(err.message)
  } finally {
    setIsLoading(false)
  }
}

// New
const [createClient, { isLoading }] = useCreateClientMutation()
const handleCreate = async () => {
  try {
    await createClient(data).unwrap()
    // Cache automatically updates
  } catch (err) {
    // Error is automatically available in the hook
  }
}
```

## Best Practices

1. **Use Queries for Reading** - Always use query hooks for fetching data
2. **Use Mutations for Writing** - Use mutation hooks for create/update/delete operations
3. **Handle Loading States** - Always handle loading and error states in your UI
4. **Use unwrap() for Mutations** - Use `.unwrap()` to get the raw result and handle errors
5. **Leverage Cache Invalidation** - Let RTK Query handle cache updates automatically
6. **Type Safety** - Define proper TypeScript interfaces for all API responses

## Error Handling

RTK Query provides structured error handling:

```typescript
const { data, error, isLoading } = useGetClientsQuery()

if (error) {
  // Error has type information
  if ('status' in error) {
    // HTTP error
    console.log('HTTP Error:', error.status)
  } else {
    // Network error
    console.log('Network Error:', error.message)
  }
}
```

## Advanced Features

### 1. Conditional Queries
```typescript
// Only fetch if user is authenticated
const { data } = useGetClientsQuery(undefined, {
  skip: !isAuthenticated
})
```

### 2. Polling
```typescript
// Refetch every 30 seconds
const { data } = useGetClientsQuery(undefined, {
  pollingInterval: 30000
})
```

### 3. Lazy Queries
```typescript
const [trigger, result] = useLazyGetClientQuery()

// Manually trigger the query
const handleClick = () => {
  trigger(clientId)
}
```

## Testing

RTK Query hooks can be tested using standard React testing patterns:

```typescript
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { useGetClientsQuery } from '@/lib/store/clientsApi'

test('should fetch clients', () => {
  const wrapper = ({ children }) => (
    <Provider store={store}>{children}</Provider>
  )
  
  const { result } = renderHook(() => useGetClientsQuery(), { wrapper })
  
  expect(result.current.isLoading).toBe(true)
})
```

## Next Steps

1. **Extend APIs** - Add more domain APIs (trainers, exercises, programs, etc.)
2. **Optimistic Updates** - Implement optimistic updates for better UX
3. **Offline Support** - Add offline capabilities with RTK Query
4. **Real-time Updates** - Integrate with WebSockets for real-time data
5. **Performance Optimization** - Fine-tune cache strategies and invalidation

## Resources

- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)