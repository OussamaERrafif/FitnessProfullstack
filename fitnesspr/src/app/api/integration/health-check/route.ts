import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status: 'error',
        message: `Backend returned ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      status: data.status || 'healthy',
      message: 'Backend health check successful',
      timestamp: new Date().toISOString(),
      backend_response: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString(),
    });
  }
}