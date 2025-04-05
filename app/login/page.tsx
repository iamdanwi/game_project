"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let formattedPhone = phone
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone
      }
      if (!formattedPhone.startsWith("+91")) {
        formattedPhone = "+91" + formattedPhone.substring(1)
      }

      const response = await login(formattedPhone)

      if (response.success === true) {
        // Redirect to OTP verification page with necessary params
        router.push(`/verify-otp?phone=${encodeURIComponent(formattedPhone)}&token=${encodeURIComponent(response.temp_token)}`)
      } else {
        setError(response.message || "Failed to send OTP. Please try again.")
      }
    } catch (error) {
      setError("Login failed. Please check your mobile number.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-136px)]">
      <div className="w-full max-w-md mx-auto p-6 flex items-center">
        <div className="w-full bg-brand-darkPurple rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
            <p className="text-gray-400 mt-2">Login to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-200">
                Mobile Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-brand-purple text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <p className="text-xs text-gray-400">Format: +91XXXXXXXXXX</p>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-brand-green hover:bg-green-700 font-bold py-3"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "SEND OTP"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-400">Don&apos;t have an account?</span>{" "}
              <Link href="/register" className="text-brand-gold hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

