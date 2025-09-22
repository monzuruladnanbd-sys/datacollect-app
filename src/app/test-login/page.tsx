"use client";

import { useState } from "react";

export default function TestLoginPage() {
  const [email, setEmail] = useState("hasan1backup@gmail.com");
  const [result, setResult] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<any>(null);

  async function checkPassword() {
    try {
      const response = await fetch('/api/test-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async function testLogin(password: string) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      setLoginResult({ password, ...data });
    } catch (error) {
      setLoginResult({ 
        password, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</a>
            <h1 className="text-2xl font-bold text-gray-900">
              🔍 Login Debug Tool
            </h1>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email to Test
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>

            <button
              onClick={checkPassword}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Check Stored Password
            </button>

            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Password Check Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
                
                {result.storedPassword && (
                  <div className="mt-4">
                    <button
                      onClick={() => testLogin(result.storedPassword)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Test Login with: {result.storedPassword}
                    </button>
                  </div>
                )}
              </div>
            )}

            {loginResult && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold mb-2">Login Test Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(loginResult, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Quick Tests:</h3>
              <div className="space-y-2">
                <button
                  onClick={() => testLogin("test123")}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 mr-2"
                >
                  Try: test123
                </button>
                <button
                  onClick={() => testLogin("123456")}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 mr-2"
                >
                  Try: 123456
                </button>
                <button
                  onClick={() => testLogin("password")}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 mr-2"
                >
                  Try: password
                </button>
                <button
                  onClick={() => testLogin("Passw0rd!")}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Try: Passw0rd!
                </button>
              </div>
            </div>

            <div className="mt-6">
              <a 
                href="/login" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
