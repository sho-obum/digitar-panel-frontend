"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeOff, Mail, Lock, Eye } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard'
    }, 2000)
  }



  return (
    <div className="h-full flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Header - 1 Row, 2 Columns */}
          <div className="flex items-center mb-8">
            {/* Column 1 - Big Logo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 overflow-hidden rounded-xl flex items-center justify-center">
                <img 
                  src="https://panel.digitarmedia.com/admin/uploads/d-logo1747116449.png"
                  alt="Digitar Media"
                  className="w-16 h-16 object-contain dark:hidden"
                />
                <img 
                  src="https://panel.digitarmedia.com/admin/uploads/digitarWhite1759991560.png"
                  alt="Digitar Media"
                  className="w-16 h-16 object-contain hidden dark:block"
                />
              </div>
            </div>
            
            {/* Vertical Divider Line */}
            <div className="h-16 w-[2px] bg-gradient-to-b from-transparent via-border/50 to-transparent mr-3"></div>
            
            {/* Column 2 - Text Content */}
            <div className="flex-1 text-left">
              {/* Row 1 - Big Welcome Back */}
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-violet-900 bg-clip-text text-transparent mb-2">
                Welcome back
              </h1>
              {/* Row 2 - Small Subtext */}
              <p className="text-muted-foreground text-sm">
                Sign in to your Digitar Media dashboard
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background focus:border-orange-400/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:bg-background focus:border-orange-400/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-blue-300 focus:ring-blue-700 focus:ring-2 focus:ring-offset-0"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-200 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-300 to-blue-800 hover:from-blue-200 hover:to-blue-800 text-white font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Divider */}
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div> */}

          {/* <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full h-11 border-border/50 hover:bg-muted/50 transition-all"
          >
            <Chrome className="mr-2 h-4 w-4" />
            Continue with Google
          </Button> */}

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don’t have an account? We’ll set one up for you - {" "}
            <button className="text-blue-300 hover:text-blue-400 font-medium transition-colors">
              Contact Us
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-950/50 rounded-r-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80')`
          }}
        />
        
        {/* Testimonial Cards */}
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 max-w-xs">
            <div className="flex items-start space-x-4">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                alt="Rahul Sharma"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Rahul Sharma
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Marketing Director • TechCorp
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  "This platform has transformed how we manage our affiliate campaigns. The ROI tracking is incredible."
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 max-w-xs">
            <div className="flex items-start space-x-4">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b172?w=40&h=40&fit=crop&crop=face"
                alt="Sarah Chen"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Sarah Chen
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sales Manager • GrowthHub
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  "Lead generation has never been easier. We've increased our conversion rates by 300% in just 3 months."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}