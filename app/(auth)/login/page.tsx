"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EyeOff, Mail, Lock, Eye, Send } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Contact form dialog state
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: redirectTo,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.refresh();
        router.push(redirectTo);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="flex items-center mb-8">
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

            <div className="h-16 w-[2px] bg-gradient-to-b from-transparent via-border/50 to-transparent mr-3"></div>

            <div className="flex-1 text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-200 to-violet-900 bg-clip-text text-transparent mb-2">
                Welcome back
              </h1>
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-300 to-blue-800 hover:from-blue-200 hover:to-blue-800 text-white font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
      </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              onClick={() => setIsContactDialogOpen(true)}
              className="text-blue-300 hover:text-blue-400 font-medium transition-colors"
            >
              Contact Us
            </button>
          </p>
        </div>
      </div>

      {/* Contact Us Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Get in Touch</DialogTitle>
            <DialogDescription>
              Fill out the form below and our team will get back to you shortly.
            </DialogDescription>
          </DialogHeader>

          {contactSuccess ? (
            <div className="text-center space-y-4 py-6">
              <div className="text-green-600 text-lg font-medium">
                ✓ Message Sent Successfully!
              </div>
              <p className="text-sm text-muted-foreground">
                Thank you for reaching out. We'll be in touch soon.
              </p>
              <Button
                onClick={() => {
                  setIsContactDialogOpen(false);
                  setContactForm({ name: "", email: "", company: "", message: "" });
                  setContactSuccess(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmittingContact(true);
                setContactError("");

                try {
                  // Simulate API call
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  setContactSuccess(true);
                } catch (err) {
                  setContactError("Failed to send message. Please try again.");
                } finally {
                  setIsSubmittingContact(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="John Doe"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="h-10 bg-background/50 border-border/50 focus:bg-background focus:border-blue-400/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="h-10 bg-background/50 border-border/50 focus:bg-background focus:border-blue-400/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-company" className="text-sm font-medium">
                  Company Name
                </Label>
                <Input
                  id="contact-company"
                  type="text"
                  placeholder="Your Company"
                  value={contactForm.company}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, company: e.target.value })
                  }
                  className="h-10 bg-background/50 border-border/50 focus:bg-background focus:border-blue-400/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-sm font-medium">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us more about your inquiry..."
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="min-h-24 resize-none bg-background/50 border-border/50 focus:bg-background focus:border-blue-400/50 transition-all"
                  required
                />
              </div>

              {contactError && (
                <p className="text-red-500 text-sm text-center font-medium">
                  {contactError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isSubmittingContact}
                className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmittingContact ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Right side - Hero Image */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-950/50 rounded-r-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80')`,
          }}
        />

        {/* Testimonials */}
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 max-w-xs">
            <div className="flex items-start space-x-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                alt="Rahul Sharma"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Rahul Sharma</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Marketing Director • TechCorp
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  "This platform has transformed how we manage our affiliate campaigns. The ROI
                  tracking is incredible."
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
                <div className="font-semibold text-gray-900 dark:text-gray-100">Sarah Chen</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sales Manager • GrowthHub
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                  "Lead generation has never been easier. We've increased our conversion rates by
                  300% in just 3 months."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
