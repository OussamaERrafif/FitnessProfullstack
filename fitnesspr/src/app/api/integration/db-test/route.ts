import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Since we don't have direct database access from the frontend,
    // we'll test if the backend can access its database
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Try to access a backend endpoint that requires database access
    const response = await fetch(`${BACKEND_URL}/api/v1/trainers`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // We expect this to fail with 401 (unauthorized) rather than 500 (database error)
    // A 401 means the database is accessible but authentication is required
    if (response.status === 401) {
      return NextResponse.json({
        success: true,
        message: 'Database connection is working (authentication required for this endpoint)',
      });
    }

    if (response.status === 500) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed - backend returned internal server error',
        error: `Status: ${response.status}`,
      });
    }

    // If we get a 200, that's also good - it means database is working
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Database connection is working - endpoint accessible',
      });
    }

    return NextResponse.json({
      success: false,
      message: `Unexpected response from database test: ${response.status}`,
      error: response.statusText,
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database test failed - could not reach backend',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}