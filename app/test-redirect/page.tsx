"use client"

import { useEffect, useState } from "react"

export default function TestRedirectPage() {
  const [authStatus, setAuthStatus] = useState("checking...")
  const [cookieTest, setCookieTest] = useState(null)

  useEffect(() => {
    const testAuth = async () => {
      try {
        // Test cookies first
        const cookieResponse = await fetch("/api/test-cookies", {
          method: "GET",
          credentials: "include",
        })
        const cookieData = await cookieResponse.json()
        setCookieTest(cookieData)

        // Test auth
        const authResponse = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        })
        const authData = await authResponse.json()
        
        if (authData.success) {
          setAuthStatus("✅ Authenticated")
          // Redirect to admin after 2 seconds
          setTimeout(() => {
            window.location.href = "/admin"
          }, 2000)
        } else {
          setAuthStatus("❌ Not authenticated: " + authData.error)
        }
      } catch (error) {
        setAuthStatus("❌ Error: " + error.message)
      }
    }

    testAuth()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Redirect Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Auth Status:</h2>
          <p>{authStatus}</p>
        </div>

        {cookieTest && (
          <div>
            <h2 className="text-lg font-semibold">Cookie Test:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(cookieTest, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            If authenticated, you will be redirected to /admin in 2 seconds...
          </p>
        </div>
      </div>
    </div>
  )
}
