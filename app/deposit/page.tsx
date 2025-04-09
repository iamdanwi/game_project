'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDepositGateway } from '@/lib/api'
import { toast } from 'sonner'
import ProfileSidebar from "@/components/shared/ProfileSidebar"
import { Textarea } from "@/components/ui/textarea"

interface Gateway {
    id: number
    name: string
    min_amount: number
    max_amount: number
    image: string
}

export default function DepositPage() {
    const router = useRouter()
    const [gateways, setGateways] = useState<Gateway[]>([])
    const [selectedGateway, setSelectedGateway] = useState<number | null>(null)
    const [amount, setAmount] = useState<string>('') // Initialize as empty string
    const [loading, setLoading] = useState(false)
    const [receiptImage, setReceiptImage] = useState<File | null>(null)
    const [paymentDescription, setPaymentDescription] = useState('')

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
        if (!amount) {
            toast.error('Please enter amount')
            return
        }

        setLoading(true)
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('https://book2500.funzip.in/api/deposit-confirm', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    gateway_id: 99
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    toast.success('Deposit request submitted successfully')
                } else {
                    toast.info('Your deposit is under verification', {
                        description: 'We will notify you once it is confirmed'
                    })
                }
                router.push('/deposit-log')
            } else {
                toast.info('Your deposit is under verification', {
                    description: 'We will notify you once it is confirmed'
                })
                router.push('/deposit-log')
            }
        } catch (error: any) {
            toast.info('Your deposit is under verification', {
                description: 'Please check transaction history for updates'
            })
            router.push('/deposit-log')
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
                                    value={amount} // Controlled input with string value
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="bg-brand-purple text-white border-gray-700 focus:border-brand-gold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-300">Upload Receipt</Label>
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setReceiptImage(e.target.files?.[0] || null)}
                                        className="w-full text-gray-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-300">Payment Description</Label>
                                <Textarea
                                    id="description"
                                    value={paymentDescription}
                                    onChange={(e) => setPaymentDescription(e.target.value)}
                                    placeholder="Enter payment details"
                                    className="bg-brand-purple text-white border-gray-700 focus:border-brand-gold min-h-[100px]"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-brand-green hover:bg-green-600 text-white"
                                disabled={loading || !amount}
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
