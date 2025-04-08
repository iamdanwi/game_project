'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDepositGateway, confirmDeposit } from '@/lib/api'
import { toast } from 'sonner'
import ProfileSidebar from "@/components/shared/ProfileSidebar"

interface Gateway {
    id: number
    name: string
    min_amount: string
    max_amount: string
    image: string
}

export default function DepositPage() {
    const router = useRouter()
    const [gateways, setGateways] = useState<Gateway[]>([])
    const [selectedGateway, setSelectedGateway] = useState<number | null>(null)
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchGateways()
    }, [])

    const fetchGateways = async () => {
        try {
            const response = await getDepositGateway()
            if (response.data) {
                setGateways(response.data.gateways || [])
            }
        } catch (error) {
            toast.error('Failed to load payment gateways')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedGateway || !amount) {
            toast.error('Please select a payment method and enter amount')
            return
        }

        setLoading(true)
        try {
            const response = await confirmDeposit({
                gateway_id: selectedGateway,
                amount: amount
            })

            if (response.success) {
                toast.success('Deposit initiated successfully')
                router.push(response.redirect_url || '/deposit-log')
            } else {
                toast.error(response.message || 'Deposit failed')
            }
        } catch (error) {
            toast.error('Failed to process deposit')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-12">
                <ProfileSidebar />
                <div className="md:col-span-9">
                    <div className="bg-brand-darkPurple rounded-lg shadow-xl p-6">
                        <h1 className="text-2xl font-bold text-white mb-6">Add Funds</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-gray-300">Select Payment Method</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    {gateways.map((gateway) => (
                                        <div
                                            key={gateway.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedGateway === gateway.id
                                                ? 'border-brand-gold bg-brand-purple'
                                                : 'border-gray-700 hover:border-brand-gold'
                                                }`}
                                            onClick={() => setSelectedGateway(gateway.id)}
                                        >
                                            <div className="text-white text-sm">{gateway.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Min: ₹{gateway.min_amount} - Max: ₹{gateway.max_amount}
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

                            <Button
                                type="submit"
                                className="w-full bg-brand-green hover:bg-green-600 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Proceed to Pay'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
