"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@datacollect.app");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/entry";
  const message = searchParams.get("message");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/login/", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }) 
      });
      const json = await res.json();
      
      if (json.ok) {
        router.replace(next);
      } else {
        setError(json.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Data Collection System</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {message === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600">Your account has been approved! You can now log in.</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Core System Accounts</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
                <p className="text-sm font-medium text-gray-900">Admin Account</p>
                <p className="text-xs text-gray-600">admin@datacollect.app / admin123</p>
                <p className="text-xs text-purple-600">Full system access and user management</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm font-medium text-gray-900">Submitter Account</p>
                <p className="text-xs text-gray-600">submitter@datacollect.app / Passw0rd!</p>
                <p className="text-xs text-blue-600">Data entry and submission</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <p className="text-sm font-medium text-gray-900">Reviewer Account</p>
                <p className="text-xs text-gray-600">reviewer@datacollect.app / Passw0rd!</p>
                <p className="text-xs text-yellow-600">Review and validate submissions</p>
              </div>
              <div className="bg-green-50 p-3 rounded-md border border-green-200">
                <p className="text-sm font-medium text-gray-900">Approver Account</p>
                <p className="text-xs text-gray-600">approver@datacollect.app / Passw0rd!</p>
                <p className="text-xs text-green-600">Final approval of submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          New to the system?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register as a Submitter
          </Link>
        </p>
      </div>
    </div>
  );
}


