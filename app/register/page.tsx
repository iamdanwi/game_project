"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp, verifySignupOtp, resendOtp } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [tempToken, setTempToken] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Format phone number if needed
      let formattedMobile = mobile
      if (!formattedMobile.startsWith("+")) {
        formattedMobile = "+" + formattedMobile
      }
      if (!formattedMobile.startsWith("+91")) {
        formattedMobile = "+91" + formattedMobile.substring(1)
      }
      formattedMobile = "+91" + formattedMobile.substring(1)

      const response = await signUp(name, email, formattedMobile)

      if (response.status === "success") {
        setTempToken(response.temp_token)
        setIsOtpSent(true)
        startCountdown()
      } else {
        setError(response.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      setError("Registration failed. Please check your details and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await verifySignupOtp(tempToken, otp)

      if (response.status === "success") {
        // Redirect to login after successful registration
        router.push("/login")
      } else {
        setError(response.message || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      setError("OTP verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    setError("")

    try {
      const response = await resendOtp(mobile)

      if (response.status === "success") {
        setTempToken(response.temp_token)
        startCountdown()
      } else {
        setError(response.message || "Failed to resend OTP. Please try again.")
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-136px)]">
      <div className="w-full max-w-md mx-auto p-6 flex items-center">
        <div className="w-full bg-brand-darkPurple rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-gray-400 mt-2">Join Book2500 and start betting!</p>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-brand-purple text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-brand-purple text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-200">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-brand-purple text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <p className="text-xs text-gray-400">Format: +91XXXXXXXXXX</p>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <Button type="submit" className="w-full bg-brand-red hover:bg-red-700 font-bold py-3" disabled={loading}>
                {loading ? "Registering..." : "SIGN UP"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-400">Already have an account?</span>{" "}
                <Link href="/login" className="text-brand-gold hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-200">
                  Enter OTP sent to your mobile
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-brand-purple text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <Button type="submit" className="w-full bg-brand-red hover:bg-red-700 font-bold py-3" disabled={loading}>
                {loading ? "Verifying..." : "VERIFY OTP"}
              </Button>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  className={`text-brand-gold ${countdown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline"}`}
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                </button>

                <button type="button" className="text-brand-gold hover:underline" onClick={() => setIsOtpSent(false)}>
                  Change Details
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

