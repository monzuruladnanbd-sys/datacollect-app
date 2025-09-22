"use client";

import { useState } from "react";

export default function FixUserPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function addUser() {
    setLoading(true);
    try {
      const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'hasan1backup@gmail.com',
          password: 'Iamrich2021',
          name: 'Hasan Backup'
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }

  async function testLogin() {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'hasan1backup@gmail.com',
          password: 'Iamrich2021'
        })
      });
      
      const data = await response.json();
      if (data.ok) {
        alert('✅ Login successful! Redirecting...');
        window.location.href = '/entry';
      } else {
        alert('❌ Login failed: ' + data.message);
      }
    } catch (error) {
      alert('❌ Login error: ' + error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</a>
            <h1 className="text-2xl font-bold text-gray-900">
              🔧 Fix User Account
            </h1>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Issue Found:</h3>
              <p className="text-yellow-700 text-sm">
                Your user <code>hasan1backup@gmail.com</code> was created during registration but didn't persist properly in the local database. This will manually add it back.
              </p>
            </div>

            <button
              onClick={addUser}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? "Adding User..." : "Add User to Database"}
            </button>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-semibold mb-2 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅ Success!' : '❌ Error'}
                </h3>
                
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>

                {result.success && (
                  <div className="mt-4">
                    <button
                      onClick={testLogin}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Test Login Now
                    </button>
                  </div>
                )}

                {result.error && (
                  <div className="mt-2">
                    <details className="text-sm text-red-600">
                      <summary className="cursor-pointer">Error Details</summary>
                      <pre className="mt-2 bg-red-100 p-2 rounded text-xs overflow-auto">
                        {result.error}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Your Credentials:</h3>
              <div className="space-y-1 text-sm font-mono">
                <div><strong>Email:</strong> hasan1backup@gmail.com</div>
                <div><strong>Password:</strong> Iamrich2021</div>
                <div><strong>Role:</strong> Submitter</div>
              </div>
            </div>

            <div className="mt-6">
              <a 
                href="/login" 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Go to Login Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
