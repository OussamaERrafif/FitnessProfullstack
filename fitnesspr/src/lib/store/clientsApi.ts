/**
 * Clients API slice
 */

import { fitnessApi } from './api'

// Types
export interface Client {
  id: string
  name: string
  email: string
  pin?: string
  phone?: string
  age?: number
  weight?: number
  height?: number
  goals?: string
  health_data?: string
  fitness_level?: 'beginner' | 'intermediate' | 'advanced'
  trainer_id?: string
  created_at: string
  updated_at: string
}

export interface CreateClientRequest {
  name: string
  email: string
  phone?: string
  age?: number
  weight?: number
  height?: number
  goals?: string
  health_data?: string
  fitness_level?: 'beginner' | 'intermediate' | 'advanced'
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string
}

// Clients API slice
export const clientsApi = fitnessApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all clients
    getClients: builder.query<Client[], void>({
      query: () => '/clients',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Client' as const, id })),
              { type: 'Client', id: 'LIST' },
            ]
          : [{ type: 'Client', id: 'LIST' }],
    }),

    // Get client by ID
    getClient: builder.query<Client, string>({
      query: (id) => `/clients/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Client', id }],
    }),

    // Create client
    createClient: builder.mutation<Client, CreateClientRequest>({
      query: (clientData) => ({
        url: '/clients',
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),

    // Update client
    updateClient: builder.mutation<Client, UpdateClientRequest>({
      query: ({ id, ...patch }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Client', id },
        { type: 'Client', id: 'LIST' },
      ],
    }),

    // Delete client
    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Client', id },
        { type: 'Client', id: 'LIST' },
      ],
    }),

    // Generate client PIN
    generateClientPin: builder.mutation<{ pin: string }, string>({
      query: (clientId) => ({
        url: `/clients/${clientId}/pin`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, clientId) => [
        { type: 'Client', id: clientId },
      ],
    }),

    // Verify client PIN
    verifyClientPin: builder.mutation<Client, { pin: string }>({
      query: ({ pin }) => ({
        url: '/clients/verify-pin',
        method: 'POST',
        body: { pin },
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

// Export hooks
export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useGenerateClientPinMutation,
  useVerifyClientPinMutation,
} = clientsApi