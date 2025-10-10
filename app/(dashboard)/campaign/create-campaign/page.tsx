
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Clock, Circle } from "lucide-react"

// Timeline Component
function Timeline({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, title: "App Details", description: "Enter app store URL" },
    { number: 2, title: "Confirm Details", description: "Verify app information" },
    { number: 3, title: "Email Composition", description: "Create outreach email" }
  ]

  const getStepState = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed"
    if (stepNumber === currentStep) return "active"
    return "pending"
  }

  const getStepIcon = (stepNumber: number) => {
    const state = getStepState(stepNumber)
    if (state === "completed") return <Check className="w-4 h-4 text-white" />
    if (state === "active") return <Clock className="w-4 h-4 text-white" />
    return <Circle className="w-4 h-4 text-muted-foreground" />
  }

  const getStepColor = (stepNumber: number) => {
    const state = getStepState(stepNumber)
    if (state === "completed") return "bg-green-500"
    if (state === "active") return "bg-blue-500"
    return "bg-muted"
  }

  return (
    <div className="flex items-center justify-center space-x-8 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(step.number)} transition-colors duration-300`}>
              {getStepIcon(step.number)}
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-muted mx-4 mt-[-24px]" />
          )}
        </div>
      ))}
    </div>
  )
}

function DotsLoader() {
  const [currentText, setCurrentText] = useState(0)
  const texts = ["Fetching...", "Analyzing...", "Processing..."]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length)
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-3 font-semibold text-indigo-600">
      <div className="flex gap-2">
        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" />
      </div>
      <span>{texts[currentText]}</span>
    </div>
  )
}

export default function CreateCampaignPage() {
  const [appUrl, setAppUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isApproved, setIsApproved] = useState(false)
  const [showWrongInput, setShowWrongInput] = useState(false)
  const [wrongContactLink, setWrongContactLink] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")

  const appData = {
    app: {
      logo: "🍔",
      name: "Swiggy - Food Delivery",
      bundleId: "in.swiggy.android",
      storeLink: "https://play.google.com/store/apps/details?id=in.swiggy.android"
    },
    org: {
      logo: "🏢",
      name: "Bundl Technologies Pvt Ltd",
      website: "https://swiggy.com",
      linkedin: "https://linkedin.com/company/swiggy"
    }
  }

  // Determine current step
  const getCurrentStep = () => {
    if (!appUrl.trim()) return 1
    if (!isApproved) return 2
    return 3
  }

  const handleFetch = async () => {
    if (!appUrl.trim()) return
    
    
    setTimeout(() => {
    }, 2000)
  }

  const handleApprove = () => {
    setIsApproved(true)
    setShowWrongInput(false)
  }

  const handleWrong = () => {
    setShowWrongInput(true)
  }

  const handleWrongSubmit = () => {
    if (!wrongContactLink.trim()) return
    
    setShowWrongInput(false)
    
    setTimeout(() => {
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* Page Header Row */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground mt-2">Set up your outreach campaign in 3 simple steps</p>
      </div>

      {/* Timeline Row */}
      <Timeline currentStep={getCurrentStep()} />

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left Column - 60% (3/5) */}
        <div className="col-span-3 space-y-6">
          {/* Row 1: App URL Input */}
          <Card>
            <CardHeader>
              <CardTitle>App Details</CardTitle>
              <CardDescription>Enter the app store URL to fetch details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter app store URL (e.g., https://play.google.com/store/apps/details?id=..."
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleFetch} disabled={isLoading || !appUrl.trim()}>
                  Fetch
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Row 2: Confirmation Details */}
          <Card className={`transition-all duration-300 relative ${!showDetails ? 'bg-muted/30' : ''}`}>
            {/* Inactive Overlay */}
            {!showDetails && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Fetch app details to continue</p>
                </div>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Confirm Details
                {isApproved && <span className="text-green-600 text-sm">✓ Approved</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <DotsLoader />
                </div>
              ) : showDetails ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* App Details */}
                    <div>
                      <h3 className="font-semibold mb-3">App Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{appData.app.logo}</span>
                          <div>
                            <p className="font-medium">{appData.app.name}</p>
                            <p className="text-sm text-muted-foreground">{appData.app.bundleId}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Store Link</Label>
                          <p className="text-sm truncate">{appData.app.storeLink}</p>
                        </div>
                      </div>
                    </div>

                    {/* Organisation Details */}
                    <div>
                      <h3 className="font-semibold mb-3">Organisation Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{appData.org.logo}</span>
                          <div>
                            <p className="font-medium">{appData.org.name}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Website</Label>
                          <p className="text-sm">{appData.org.website}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                          <p className="text-sm">{appData.org.linkedin}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  {!isApproved && (
                    <div className="flex gap-3">
                      <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                        ✓ Approve
                      </Button>
                      <Button variant="destructive" onClick={handleWrong}>
                        ✗ Wrong
                      </Button>
                    </div>
                  )}

                  {/* Wrong Contact Input */}
                  {showWrongInput && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                      <Label htmlFor="wrongContact">Enter correct contact link</Label>
                      <div className="flex gap-3 mt-2">
                        <Input
                          id="wrongContact"
                          placeholder="Enter approachable person's contact link"
                          value={wrongContactLink}
                          onChange={(e) => setWrongContactLink(e.target.value)}
                        />
                        <Button onClick={handleWrongSubmit}>OK</Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-muted rounded animate-pulse" />
                    <div className="w-3/4 h-4 bg-muted rounded animate-pulse mx-auto" />
                    <div className="w-1/2 h-4 bg-muted rounded animate-pulse mx-auto" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 40% (2/5) */}
        <div className="col-span-2 h-full">
          <Card className={`h-full flex flex-col transition-all duration-300 relative ${!isApproved ? 'bg-muted/30' : ''}`}>
            {/* Inactive Overlay */}
            {!isApproved && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl">✉️</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Approve details to compose email</p>
                </div>
              </div>
            )}
            
            <CardHeader className="flex-shrink-0">
              <CardTitle>Email Composition</CardTitle>
              <CardDescription>Compose your outreach email</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <div className="flex-shrink-0">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Partnership Opportunity with Swiggy"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              
              <div className="flex-1 flex flex-col min-h-0">
                <Label htmlFor="content" className="mb-2">Email Content</Label>
                <textarea
                  id="content"
                  className="w-full flex-1 p-3 border rounded-md resize-none min-h-[120px]"
                  placeholder="Dear Swiggy Team,

I hope this email finds you well. I'm reaching out to explore potential partnership opportunities between our organizations..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
              </div>

              {/* AI Suggestions */}
              <div className="flex-shrink-0">
                <Label className="text-sm font-medium">AI Suggestions</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">💡 Suggested improvements:</p>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>• Mention specific Swiggy features you admire</li>
                      <li>• Include your company's relevant metrics</li>
                      <li>• Propose a specific collaboration timeline</li>
                      <li>• Add a clear call-to-action</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full flex-shrink-0" 
                disabled={!emailSubject.trim() || !emailContent.trim()}
              >
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}