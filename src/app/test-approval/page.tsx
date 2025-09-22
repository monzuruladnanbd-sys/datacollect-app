'use client';

import { useState } from 'react';

export default function TestApprovalPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'testpass123'
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

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@example.com',
          password: 'testpass123'
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

  const testPendingUsers = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/admin/pending-users');
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
              Test Approval System
            </h1>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={testRegistration}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test User Registration'}
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Login (should fail for pending user)'}
            </button>
            
            <button
              onClick={testPendingUsers}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 ml-4"
            >
              {loading ? 'Testing...' : 'Test Get Pending Users'}
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

