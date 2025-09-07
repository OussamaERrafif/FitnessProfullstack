import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Test CORS by making a request from the frontend to the backend
    const response = await fetch(`${BACKEND_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `CORS test failed: Backend returned ${response.status}`,
        error: `${response.status}: ${response.statusText}`,
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'CORS configuration is working correctly',
      backend_response: data,
      cors_headers: {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'CORS test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}