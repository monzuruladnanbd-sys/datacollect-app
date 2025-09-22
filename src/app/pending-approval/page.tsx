'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PendingApprovalPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // Get email from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const email = urlParams.get('email') || localStorage.getItem('pendingUserEmail') || ''
    setUserEmail(email)
  }, [])

  const handleCheckStatus = async () => {
    if (!userEmail) return

    try {
      const response = await fetch(`/api/check-user-status?email=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      if (data.approved) {
        // User is approved, redirect to login
        router.push('/login?message=approved')
      } else if (data.rejected) {
        // User is rejected
        alert('Your account has been rejected. Please contact the administrator.')
      } else {
        // Still pending
        alert('Your account is still pending approval. Please check back later.')
      }
    } catch (error) {
      alert('Error checking status. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block">🏠 Back to Home</a>
          <div className="mx-auto h-12 w-12 text-orange-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your registration has been submitted successfully
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Awaiting Admin Approval
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>
                      Your account registration is currently under review by our administrators. 
                      You will receive an email notification once your account is approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {userEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Registration Details</h4>
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {userEmail}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>Status:</strong> Pending Approval
                </p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleCheckStatus}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Check Approval Status
              </button>

              <div className="text-center">
                <button
                  onClick={() => router.push('/login')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                If you have any questions, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



