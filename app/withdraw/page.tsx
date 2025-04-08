'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getWithdrawMethods } from '@/lib/api'
import { toast } from 'sonner'
import ProfileSidebar from "@/components/shared/ProfileSidebar"

interface WithdrawMethod {
    id: number
    name: string
    min_limit: string
    max_limit: string
    processing_time: string
}

export default function WithdrawPage() {
    const router = useRouter()
    const [methods, setMethods] = useState<WithdrawMethod[]>([])
    const [selectedMethod, setSelectedMethod] = useState<number | null>(null)
    const [amount, setAmount] = useState('')
    const [accountDetails, setAccountDetails] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchWithdrawMethods()
    }, [])

    const fetchWithdrawMethods = async () => {
        try {
            const response = await getWithdrawMethods()
            if (response.data) {
                setMethods(response.data.methods || [])
            }
        } catch (error) {
            toast.error('Failed to load withdrawal methods')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Better validation checks
        if (!amount || amount === '0') {
            toast.error('Please enter a valid amount')
            return
        }

        if (!accountDetails) {
            toast.error('Please enter account details')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) {
                toast.error('Authentication required')
                return
            }
            // console.log(`Bearer token: ${token}`)
            const response = await fetch('https://book2500.funzip.in/api/withdraw', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    method_id: selectedMethod,
                    detail: accountDetails
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Withdrawal request submitted')
                router.push('/transaction-log')
            } else {
                toast.error(data.message || 'Withdrawal failed')
            }
        } catch (error) {
            toast.error('Failed to process withdrawal')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-12">
                <ProfileSidebar />
                <div className="md:col-span-9">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-brand-darkPurple rounded-lg shadow-xl p-6">
                            <h1 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-gray-300">Select Withdrawal Method</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {methods.map((method) => (
                                            <div
                                                key={method.id}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === method.id
                                                    ? 'border-brand-gold bg-brand-purple'
                                                    : 'border-gray-700 hover:border-brand-gold'
                                                    }`}
                                                onClick={() => setSelectedMethod(method.id)}
                                            >
                                                <div className="text-white text-sm">{method.name}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Min: ₹{method.min_limit} - Max: ₹{method.max_limit}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Processing Time: {method.processing_time}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-gray-300">Amount (₹)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="bg-brand-purple text-white border-gray-700 focus:border-brand-gold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="account" className="text-gray-300">Account Details</Label>
                                    <Input
                                        id="account"
                                        value={accountDetails}
                                        onChange={(e) => setAccountDetails(e.target.value)}
                                        placeholder="Enter your account details"
                                        className="bg-brand-purple text-white border-gray-700 focus:border-brand-gold"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-brand-green hover:bg-green-600 text-white"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Submit Withdrawal'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
