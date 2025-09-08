/**
 * Example RTK Query Client List Component
 * Demonstrates fetching data with RTK Query hooks
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import { useGetClientsQuery } from "@/lib/store/clientsApi"

export function RTKQueryClientsList() {
  // RTK Query hook automatically handles loading, error, and data states
  const {
    data: clients,
    error,
    isLoading,
    refetch,
  } = useGetClientsQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading clients...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              {'data' in error 
                ? (error.data as any)?.message || 'Failed to load clients'
                : 'Network error occurred'
              }
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clients ({clients?.length || 0})
          </CardTitle>
          <CardDescription>
            Manage your client roster and their fitness journeys
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/trainer/clients/new">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!clients || clients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No clients yet</h3>
            <p className="text-gray-600 mb-4">
              Start building your client base by adding your first client
            </p>
            <Button asChild>
              <Link href="/trainer/clients/new">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Client
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{client.name}</h4>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  {client.fitness_level && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                      {client.fitness_level}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/trainer/clients/${client.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}