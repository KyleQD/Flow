"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthErrorDisplay } from "@/components/ui/auth-error-display"
import { mapAuthError, AuthErrorInfo } from "@/lib/auth-errors"
import { Building, Users, Star, ArrowRight, Loader2, Eye, EyeOff, Sparkles, Zap, Globe, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { TourifyLogo } from "@/components/tourify-logo"

export default function LoginPage() {
  const { user, loading, isAuthenticated, signIn, signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<AuthErrorInfo | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Sign In form
  const [signInData, setSignInData] = useState({
    email: "",
    password: ""
  })
  
  // Sign Up form
  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    username: ""
  })

  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError(null)
    }
    if (success) {
      setSuccess(null)
    }
  }, [signInData.email, signInData.password, signUpData.email, signUpData.password])

  // Listen for authentication state changes to redirect immediately
  useEffect(() => {
    if (isAuthenticated && success && !isRedirecting) {
      // User is now authenticated and we've shown success message
      const validRedirectTo = redirectTo.startsWith('/') ? redirectTo : '/dashboard'
      console.log('[Login] User authenticated, preparing redirect to:', validRedirectTo)
      
      setIsRedirecting(true)
      setSuccess('Successfully signed in! Redirecting to dashboard...')
      
      // Give the auth state a moment to fully propagate
      setTimeout(() => {
        console.log('[Login] Executing redirect to:', validRedirectTo)
        router.push(validRedirectTo)
      }, 1000)
    }
  }, [isAuthenticated, success, redirectTo, router, isRedirecting])

  const handleRetry = () => {
    setError(null)
    setSuccess(null)
    setIsRedirecting(false)
  }

  const handleContactSupport = () => {
    // You can replace this with your actual support contact method
    window.open('mailto:support@tourify.com?subject=Login Issue', '_blank')
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsRedirecting(false)
    setIsSubmitting(true)
    
    try {
      console.log('[Login] Attempting sign in for:', signInData.email)
      const result = await signIn(signInData.email, signInData.password)
      
      if (result.error) {
        console.log('[Login] Sign in error:', result.error)
        const errorInfo = mapAuthError(result.error)
        setError(errorInfo)
      } else {
        console.log('[Login] Sign in successful, setting success state')
        setSuccess('Successfully signed in! Please wait...')
        // The redirect will be handled by the useEffect above when isAuthenticated becomes true
      }
    } catch (err) {
      console.log('[Login] Sign in exception:', err)
      const errorInfo = mapAuthError(err instanceof Error ? err : 'Failed to sign in')
      setError(errorInfo)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    // Client-side validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError(mapAuthError("Passwords don't match"))
      return
    }
    
    if (signUpData.password.length < 6) {
      setError(mapAuthError("Password must be at least 6 characters"))
      return
    }

    if (!signUpData.email || !signUpData.email.includes('@')) {
      setError(mapAuthError("Please enter a valid email address"))
      return
    }

    if (!signUpData.name.trim()) {
      setError(mapAuthError("Please enter your full name"))
      return
    }

    if (!signUpData.username.trim()) {
      setError(mapAuthError("Please enter a username"))
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = await signUp(signUpData.email, signUpData.password, { 
        full_name: signUpData.name, 
        username: signUpData.username 
      })
      
      if (result.error) {
        const errorInfo = mapAuthError(result.error)
        setError(errorInfo)
      } else {
        setSuccess('Account created successfully! Please check your email to confirm your account.')
        // Don't redirect immediately for sign up - let them confirm email first
      }
    } catch (err) {
      const errorInfo = mapAuthError(err instanceof Error ? err : 'Failed to sign up')
      setError(errorInfo)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center bg-repeat opacity-10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding & Info */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo */}
            <div className="flex justify-center lg:justify-start">
              <TourifyLogo 
                variant="white" 
                size="6xl"
                className="filter drop-shadow-2xl" 
              />
            </div>
            
            {/* Tagline */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-200">
                Connect. Create. Tour. Succeed.
              </h1>
            </div>
            
            {/* Hero Text */}
            <div className="space-y-6">
              <p className="text-xl lg:text-2xl text-white font-medium leading-relaxed max-w-2xl">
                Tourify is revolutionizing how artists, venues, and industry professionals collaborate.
              </p>
              
              <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">
                From discovering your next venue to booking world-class talent, managing tours to building 
                lasting industry relationships — Tourify powers every aspect of your music career with 
                cutting-edge technology and real-time insights.
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <div className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Professional EPKs</h3>
                    <p className="text-sm text-gray-300">Create stunning press kits that get you booked</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Smart Venue Matching</h3>
                    <p className="text-sm text-gray-300">AI-powered venue discovery for perfect shows</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Industry Network</h3>
                    <p className="text-sm text-gray-300">Connect with 50K+ verified music professionals</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Tour Management</h3>
                    <p className="text-sm text-gray-300">End-to-end tour planning and real-time analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Auth Forms */}
          <div className="w-full max-w-md mx-auto">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-white font-bold">Welcome to the Future</CardTitle>
                <CardDescription className="text-gray-300">
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 backdrop-blur-sm">
                    <div className="flex items-center text-green-200">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{success}</span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <AuthErrorDisplay
                    error={error}
                    onRetry={handleRetry}
                    onContactSupport={handleContactSupport}
                    className="mb-6"
                  />
                )}
                
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
                    <TabsTrigger value="signin" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  {/* Sign In Tab */}
                  <TabsContent value="signin" className="space-y-4 mt-6">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-white font-medium">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-white font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={signInData.password}
                            onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 pr-10"
                            required
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            disabled={isSubmitting}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Signing In...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                    
                    <div className="text-center">
                      <Button variant="link" className="text-purple-400 hover:text-purple-300" asChild>
                        <Link href="/forgot-password">
                          Forgot your password?
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                  
                  {/* Sign Up Tab */}
                  <TabsContent value="signup" className="space-y-4 mt-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name" className="text-white font-medium">Full Name</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={signUpData.name}
                            onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="signup-username" className="text-white font-medium">Username</Label>
                          <Input
                            id="signup-username"
                            type="text"
                            placeholder="johndoe"
                            value={signUpData.username}
                            onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-white font-medium">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@example.com"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-white font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={signUpData.password}
                            onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 pr-10"
                            required
                            minLength={6}
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            disabled={isSubmitting}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password" className="text-white font-medium">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signUpData.confirmPassword}
                            onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder-gray-400 backdrop-blur-sm focus:border-purple-500 focus:ring-purple-500/50 pr-10"
                            required
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            disabled={isSubmitting}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creating Account...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            Create Account
                            <Sparkles className="ml-2 h-4 w-4" />
                          </div>
                        )}
                      </Button>
                    </form>
                    
                    <div className="text-center text-sm text-gray-400">
                      By signing up, you agree to our{" "}
                      <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                        Privacy Policy
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Footer */}
            <div className="text-center mt-8 text-gray-400 text-sm">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-4 w-4" />
                <span>Secured by enterprise-grade encryption</span>
              </div>
              <p>© 2024 Tourify. The future of music networking.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
} 