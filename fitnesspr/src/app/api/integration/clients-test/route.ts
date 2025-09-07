import { NextResponse } from 'next/server';

export async function GET() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  const tests = [
    { name: 'List clients', path: '/api/v1/clients', method: 'GET' },
    { name: 'Create client', path: '/api/v1/clients', method: 'POST' },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const response = await fetch(`${BACKEND_URL}${test.path}`, {
        method: test.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // For POST requests, send empty body to trigger validation error
        body: test.method === 'POST' ? '{}' : undefined,
      });

      // We expect authentication errors (401) since we're not sending auth tokens
      // This indicates the endpoints are accessible and properly protected
      if (response.status === 401) {
        results.push({
          test: test.name,
          status: 'success',
          message: 'Endpoint accessible and properly protected',
        });
      } else if (response.status === 422) {
        results.push({
          test: test.name,
          status: 'success',
          message: 'Endpoint accessible (validation error expected)',
        });
      } else if (response.status === 404) {
        results.push({
          test: test.name,
          status: 'error',
          message: 'Endpoint not found',
        });
      } else if (response.status === 500) {
        results.push({
          test: test.name,
          status: 'error',
          message: 'Internal server error',
        });
      } else {
        results.push({
          test: test.name,
          status: 'success',
          message: `Endpoint accessible (${response.status})`,
        });
      }
    } catch (error) {
      results.push({
        test: test.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const allPassed = results.every(r => r.status === 'success');

  return NextResponse.json({
    success: allPassed,
    message: allPassed 
      ? 'All client endpoints are accessible' 
      : 'Some client endpoints failed',
    results,
  });
}