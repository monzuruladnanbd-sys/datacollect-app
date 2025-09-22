'use client';

import { useState } from 'react';

export default function TestAdminLoginPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAdminLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@datacollect.app',
          password: 'admin123'
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testOtherLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'data@example.com',
          password: 'Passw0rd!'
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</a>
            <h1 className="text-2xl font-bold text-gray-900">
              Test Admin Login
            </h1>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={testAdminLogin}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Admin Login (admin@datacollect.app)'}
            </button>
            
            <button
              onClick={testOtherLogin}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Other Login (data@example.com)'}
            </button>
          </div>
          
          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

