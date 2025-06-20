"use client"

import React, { useState } from "react"
import { AuthErrorDisplay } from "@/components/ui/auth-error-display"
import { mapAuthError, AuthErrorInfo } from "@/lib/auth-errors"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AuthErrorDemoPage() {
  const [selectedError, setSelectedError] = useState<AuthErrorInfo | null>(null)

  // Example errors to demonstrate the system
  const exampleErrors = [
    "Invalid login credentials",
    "Email not confirmed", 
    "User already registered",
    "Password is too weak",
    "Too many requests",
    "Network error occurred",
    "Session expired",
    "Account disabled",
    "Invalid email format",
    "Internal server error",
    "Random unknown error"
  ]

  const handleRetry = () => {
    alert("Retry button clicked! This would trigger the retry logic.")
  }

  const handleContactSupport = () => {
    alert("Contact support clicked! This would open your support system.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Authentication Error Handling Demo
          </h1>
          <p className="text-xl text-gray-300">
            Enhanced error handling system with user-friendly messages and actionable guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Error Selection */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Select an Error to Demo</CardTitle>
              <CardDescription className="text-gray-300">
                Click on any error type to see how it's handled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exampleErrors.map((errorMessage, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => setSelectedError(mapAuthError(errorMessage))}
                  className="w-full justify-start bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                >
                  <span className="truncate">{errorMessage}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Error Display */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Error Display</CardTitle>
              <CardDescription className="text-gray-300">
                This is how errors appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedError ? (
                <div className="space-y-4">
                  {/* Error Details */}
                  <div className="space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">Severity:</span>
                      <Badge 
                        variant={selectedError.severity === 'error' ? 'destructive' : 
                               selectedError.severity === 'warning' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {selectedError.severity}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-white">Actionable:</span>
                      <span className="ml-2 text-gray-300">
                        {selectedError.actionable ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedError.action && (
                      <div className="text-sm">
                        <span className="font-medium text-white">Suggested Action:</span>
                        <span className="ml-2 text-gray-300">{selectedError.action}</span>
                      </div>
                    )}
                  </div>

                  {/* Actual Error Component */}
                  <AuthErrorDisplay
                    error={selectedError}
                    onRetry={handleRetry}
                    onContactSupport={handleContactSupport}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>Select an error from the left to see the enhanced error display</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Enhanced Error Handling Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-400">🎯 Specific Error Detection</h3>
                <p className="text-sm text-gray-300">
                  Detects and categorizes common authentication errors like invalid credentials, 
                  unconfirmed emails, rate limiting, and network issues.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-blue-400">💡 Actionable Guidance</h3>
                <p className="text-sm text-gray-300">
                  Provides clear, actionable instructions for users on how to resolve 
                  each type of error they encounter.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-green-400">🔄 Smart Retry Logic</h3>
                <p className="text-sm text-gray-300">
                  Offers appropriate retry options and contact support buttons 
                  based on the error type and context.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-yellow-400">🎨 Severity-Based Styling</h3>
                <p className="text-sm text-gray-300">
                  Uses color-coded severity levels (error, warning, info) to 
                  communicate the urgency and type of issue.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-indigo-400">📝 Detailed Logging</h3>
                <p className="text-sm text-gray-300">
                  Enhanced console logging with structured information for 
                  better debugging and monitoring.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-pink-400">✨ Consistent UX</h3>
                <p className="text-sm text-gray-300">
                  Unified error handling across login, signup, password reset, 
                  and all authentication flows.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Implementation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Files Created/Modified:</h3>
              <ul className="text-sm text-gray-300 space-y-1 ml-4">
                <li>• <code className="text-purple-400">lib/auth-errors.ts</code> - Error mapping utility</li>
                <li>• <code className="text-purple-400">components/ui/auth-error-display.tsx</code> - Error display component</li>
                <li>• <code className="text-purple-400">app/login/page.tsx</code> - Enhanced login page</li>
                <li>• <code className="text-purple-400">app/forgot-password/page.tsx</code> - Enhanced forgot password</li>
                <li>• <code className="text-purple-400">app/reset-password/page.tsx</code> - Enhanced reset password</li>
                <li>• <code className="text-purple-400">contexts/auth-context.tsx</code> - Improved logging</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-white">Key Benefits:</h3>
              <ul className="text-sm text-gray-300 space-y-1 ml-4">
                <li>• Users get clear, helpful error messages instead of technical jargon</li>
                <li>• Specific guidance for each error type reduces support requests</li>
                <li>• Better debugging with structured console logging</li>
                <li>• Consistent error handling across all authentication flows</li>
                <li>• Improved user experience with actionable error states</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 