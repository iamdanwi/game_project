'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyOtp, verifySignupOtp, resendOtp } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function OtpVerificationForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(60)

    const phone = searchParams.get('phone')
    const token = searchParams.get('token')
    const isSignup = searchParams.get('isSignup') === 'true'

    useEffect(() => {
        if (!phone || !token) {
            router.push(isSignup ? '/register' : '/login')
        }
    }, [phone, token, router, isSignup])

    useEffect(() => {
        const timer = countdown > 0 && setInterval(() => setCountdown(prev => prev - 1), 1000)
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [countdown])

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const verifyFunction = isSignup ? verifySignupOtp : verifyOtp
            const response = await verifyFunction(token!, otp)

            if (response.login === true || response.register === true) {
                localStorage.setItem('auth_token', response.token)
                localStorage.setItem('user_data', JSON.stringify(response.data))
                // Dispatch custom event for auth change
                window.dispatchEvent(new Event('auth-change'))
                router.push('/')
            } else {
                setError(response.message || "Invalid OTP. Please try again.")
            }
        } catch (error) {
            setError("Verification failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (countdown > 0) return
        try {
            const response = await resendOtp(phone!)
            if (response.success === true) {
                setCountdown(60)
            } else {
                setError(response.message || "Failed to resend OTP")
            }
        } catch (error) {
            setError("Failed to resend OTP")
        }
    }

    return (
        <div className="flex min-h-[calc(100vh-136px)]">
            <div className="w-full max-w-md mx-auto p-6 flex items-center">
                <div className="w-full bg-brand-darkPurple rounded-lg shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Verify OTP</h1>
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
                                className={`text-brand-gold ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:underline'}`}
                                onClick={handleResendOtp}
                                disabled={countdown > 0}
                            >
                                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                            </button>

                            <button
                                type="button"
                                className="text-brand-gold hover:underline"
                                onClick={() => router.push(isSignup ? '/register' : '/login')}
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
