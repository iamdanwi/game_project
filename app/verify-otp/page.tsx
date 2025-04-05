"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyOtp, resendOtp } from "@/lib/api"

export default function VerifyOtpPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get("phone") || ""
    const tempToken = searchParams.get("token") || ""

    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(60)

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1)
            }, 1000)
        }
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [countdown])

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await verifyOtp(tempToken, otp)
            console.log(response)
            if (response.login === true) {
                router.push("/profile")
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
        <div className="flex min-h-[calc(100vh-136px)]">
            <div className="w-full max-w-md mx-auto p-6 flex items-center">
                <div className="w-full bg-brand-darkPurple rounded-lg shadow-xl p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-white">Verify OTP</h1>
                        <p className="text-gray-400 mt-2">Enter the OTP sent to {phone}</p>
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
                                onClick={() => router.push("/login")}
                            >
                                Change Number
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
