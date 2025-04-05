import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyOtp, resendOtp } from "@/lib/api"
import { useRouter } from "next/navigation"

interface OtpVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  phone: string
  tempToken: string
  onVerificationComplete?: () => void
}

export default function OtpVerificationModal({
  isOpen,
  onClose,
  phone,
  tempToken,
  onVerificationComplete,
}: OtpVerificationModalProps) {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (isOpen) {
      setOtp("") // Clear OTP when modal opens
      setError("") // Clear any previous errors
      setCountdown(60) // Reset countdown
    }
  }, [isOpen])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isOpen, countdown])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await verifyOtp(tempToken, otp)

      if (response.status === "success") {
        onVerificationComplete?.()
        router.push("/")
        onClose()
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
      const response = await resendOtp(phone)

      if (response.status === "success") {
        setCountdown(60)
      } else {
        setError(response.message || "Failed to resend OTP. Please try again.")
      }
    } catch (error) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  return (
    isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-brand-darkPurple rounded-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
            <p className="text-gray-400 mt-2">
              Enter the OTP sent to {phone}
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-200">
                Enter OTP
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

            <Button
              type="submit"
              className="w-full bg-brand-green hover:bg-green-700 font-bold py-3"
              disabled={loading}
            >
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

              <button
                type="button"
                className="text-brand-gold hover:underline"
                onClick={onClose}
              >
                Change Number
              </button>
            </div>
          </form>
        </div>
      </div>
    ) : null
  )
}