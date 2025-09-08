import { NextResponse } from 'next/server';

export async function GET() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  const tests = [
    { name: 'Login endpoint', path: '/api/v1/auth/login', method: 'POST' },
    { name: 'Register endpoint', path: '/api/v1/auth/register', method: 'POST' },
    { name: 'Me endpoint', path: '/api/v1/auth/me', method: 'GET' },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const config: RequestInit = {
        method: test.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };

      // Add body only for POST requests
      if (test.method === 'POST') {
        config.body = '{}';
      }

      const response = await fetch(`${BACKEND_URL}${test.path}`, config);

      // We expect validation errors (422) or authentication errors (401)
      // These indicate the endpoints are accessible
      if (response.status === 422 || response.status === 401) {
        results.push({
          test: test.name,
          status: 'success',
          message: `Endpoint accessible (${response.status})`,
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
      ? 'All authentication endpoints are accessible' 
      : 'Some authentication endpoints failed',
    results,
  });
}