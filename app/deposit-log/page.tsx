'use client'

import { useEffect, useState } from 'react'
import ProfileSidebar from "@/components/shared/ProfileSidebar"

interface DepositLog {
    id: string
    amount: string
    method: string
    status: number // Changed to number type
    transaction_id: string
    created_at: string
}

export default function DepositLogPage() {
    const [deposits, setDeposits] = useState<DepositLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDepositHistory()
    }, [])

    const fetchDepositHistory = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch('https://book2500.funzip.in/api/deposit-log', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            const data = await response.json()
            console.log(data)
            setDeposits(data.deposits || [])
        } catch (error) {
            console.error('Failed to fetch deposit history:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        })
    }

    const getStatusDisplay = (status: string) => {
        if (status === "0") {
            return {
                text: 'Pending',
                className: 'bg-yellow-500/20 text-yellow-400'
            }
        } else if (status === "-1") {
            return {
                text: 'Failed',
                className: 'bg-red-500/20 text-red-400'
            }
        } else {
            return {
                text: 'Successful',
                className: 'bg-green-500/20 text-green-400'
            }
        }

    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-12">
                <ProfileSidebar />
                <div className="md:col-span-9">
                    <div className="bg-brand-darkPurple rounded-lg shadow-xl p-6">
                        <h1 className="text-2xl font-bold text-white mb-6">Deposit History</h1>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-brand-purple">
                                    <tr>
                                        <th className="px-6 py-3 text-gray-300">Date</th>
                                        <th className="px-6 py-3 text-gray-300">Amount</th>
                                        <th className="px-6 py-3 text-gray-300">Method</th>
                                        <th className="px-6 py-3 text-gray-300">Transaction ID</th>
                                        <th className="px-6 py-3 text-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deposits.map((deposit) => (
                                        <tr key={deposit.id} className="border-b border-gray-700">
                                            <td className="px-6 py-4 text-white">{formatDate(deposit.created_at)}</td>
                                            <td className="px-6 py-4 text-white">₹{deposit.amount}</td>
                                            <td className="px-6 py-4 text-white">{deposit.method}</td>
                                            <td className="px-6 py-4 text-gray-300">{deposit.transaction_id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${getStatusDisplay(deposit.status.toString()).className}`}>
                                                    {getStatusDisplay(deposit.status.toString()).text}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
