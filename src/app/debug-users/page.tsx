"use client";

import { useState, useEffect } from "react";

export default function DebugUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    getStoredPasswords();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/debug-users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStoredPasswords() {
    try {
      const stored = localStorage.getItem('wb_user_passwords');
      if (stored) {
        setPasswords(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error getting passwords:', error);
    }
  }

  async function testLogin(email: string, password: string) {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      
      if (result.ok) {
        alert(`✅ Login successful for ${email}!`);
      } else {
        alert(`❌ Login failed for ${email}: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Login error for ${email}: ${error}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</a>
            <h1 className="text-2xl font-bold text-gray-900">
              🔍 Debug: Current Users in System
            </h1>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">System Status</h3>
            <p className="text-blue-700 text-sm">
              Total users found: <strong>{users.length}</strong>
            </p>
            <p className="text-blue-700 text-sm">
              Stored passwords: <strong>{Object.keys(passwords).length}</strong>
            </p>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No users found in the system.</p>
              <a 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register a User
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => {
                const password = passwords[user.email.toLowerCase()];
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.full_name || user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Role: <span className="font-medium">{user.role}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {password ? (
                          <div>
                            <p className="text-sm text-gray-600">
                              Password: <code className="bg-gray-100 px-2 py-1 rounded">{password}</code>
                            </p>
                            <button
                              onClick={() => testLogin(user.email, password)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Test Login
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-red-600">No password stored</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-x-4">
              <a 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Register New User
              </a>
              <a 
                href="/login" 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Go to Login
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
