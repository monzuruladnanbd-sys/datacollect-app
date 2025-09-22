"use client";

import { useState } from "react";

export default function InitDemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function initializeDemo() {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/init-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</a>
            <h1 className="text-3xl font-bold text-gray-900">
              🚀 Initialize Demo System
            </h1>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              This will populate your Supabase database with demo users for testing the system.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Creates admin, submitter, reviewer, and approver accounts</li>
                <li>• Sets up your personal account (monzurul.adnan.bd@gmail.com)</li>
                <li>• Configures demo passwords for testing</li>
                <li>• Makes the system ready for use</li>
              </ul>
            </div>
          </div>

          <button
            onClick={initializeDemo}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? "Initializing..." : "Initialize Demo Users"}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
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

              {result.success && result.credentials && (
                <div className="mt-4">
                  <h4 className="font-medium text-green-800 mb-2">Demo Login Credentials:</h4>
                  <div className="bg-white rounded border border-green-300 p-3 space-y-1 text-sm font-mono">
                    <div><strong>Admin:</strong> {result.credentials.admin}</div>
                    <div><strong>Submitter:</strong> {result.credentials.submitter}</div>
                    <div><strong>Reviewer:</strong> {result.credentials.reviewer}</div>
                    <div><strong>Approver:</strong> {result.credentials.approver}</div>
                    <div className="pt-2 border-t border-green-200">
                      <strong>Your Account:</strong> {result.credentials.yourAccount}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href="/login" 
                      className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      Go to Login →
                    </a>
                  </div>
                </div>
              )}

              {!result.success && result.error && (
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
        </div>
      </div>
    </div>
  );
}
