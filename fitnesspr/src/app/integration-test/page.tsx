'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp: string;
}

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

export default function IntegrationTest() {
  const [backendHealth, setBackendHealth] = useState<HealthStatus | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runHealthCheck = async () => {
    try {
      const response = await fetch('/api/integration/health-check');
      const data = await response.json();
      setBackendHealth(data);
    } catch (error) {
      console.error('Health check failed:', error);
      setBackendHealth({ status: 'error', timestamp: new Date().toISOString() });
    }
  };

  const runIntegrationTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    const tests = [
      { name: 'Backend Health Check', endpoint: '/api/integration/health-check' },
      { name: 'API CORS Configuration', endpoint: '/api/integration/cors-test' },
      { name: 'Database Connection', endpoint: '/api/integration/db-test' },
      { name: 'Authentication Endpoints', endpoint: '/api/integration/auth-test' },
      { name: 'Client Endpoints', endpoint: '/api/integration/clients-test' },
    ];

    for (const test of tests) {
      const result: TestResult = { name: test.name, status: 'pending' };
      setTestResults(prev => [...prev, result]);

      try {
        const startTime = Date.now();
        const response = await fetch(test.endpoint);
        const data = await response.json();
        const duration = Date.now() - startTime;

        setTestResults(prev => prev.map(r => 
          r.name === test.name 
            ? { 
                ...r, 
                status: data.success ? 'success' : 'error',
                message: data.message || data.error,
                duration 
              }
            : r
        ));
      } catch (error) {
        setTestResults(prev => prev.map(r => 
          r.name === test.name 
            ? { ...r, status: 'error', message: error instanceof Error ? error.message : 'Unknown error' }
            : r
        ));
      }

      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunningTests(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Running...</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Backend-Frontend Integration Test</h1>
        <p className="text-muted-foreground">
          Verify that the FastAPI backend and Next.js frontend are properly connected
        </p>
      </div>

      {/* Backend Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Backend Health Status
            {backendHealth?.status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {backendHealth?.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          </CardTitle>
          <CardDescription>
            Current status of the FastAPI backend server
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backendHealth ? (
            <div className="space-y-2">
              <Alert variant={backendHealth.status === 'healthy' ? 'default' : 'destructive'}>
                <AlertDescription>
                  Backend Status: <strong>{backendHealth.status}</strong>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground">
                Last checked: {new Date(backendHealth.timestamp).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking backend health...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Tests</CardTitle>
          <CardDescription>
            Run comprehensive tests to verify the backend-frontend integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runIntegrationTests} 
            disabled={isRunningTests}
            className="w-full"
          >
            {isRunningTests ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Integration Tests'
            )}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results:</h3>
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {test.duration && (
                      <span className="text-sm text-muted-foreground">
                        {test.duration}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                  {test.message && test.status === 'error' && (
                    <p className="text-sm text-red-600 mt-2">{test.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {testResults.length > 0 && !isRunningTests && (
            <div className="pt-4 border-t">
              <Alert>
                <AlertDescription>
                  <strong>Summary:</strong>{' '}
                  {testResults.filter(t => t.status === 'success').length} passed,{' '}
                  {testResults.filter(t => t.status === 'error').length} failed
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            What to do after the integration tests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc list-inside text-sm">
            <li>If all tests pass, the integration is working correctly</li>
            <li>If tests fail, check the console for detailed error messages</li>
            <li>Verify both servers are running (Backend: http://localhost:8000, Frontend: http://localhost:3000)</li>
            <li>Check CORS configuration in the backend</li>
            <li>Ensure environment variables are properly configured</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}