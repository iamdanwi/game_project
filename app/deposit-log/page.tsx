'use client'

import { useEffect, useState } from 'react'
import ProfileSidebar from "@/components/shared/ProfileSidebar"

interface DepositLog {
    id: string
    amount: string
    method: string
    status: 'pending' | 'completed' | 'rejected'
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
            const response = await fetch('https://test.book2500.in/deposit-log', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
            const data = await response.json()
            setDeposits(data.deposits || [])
        } catch (error) {
            console.error('Failed to fetch deposit history:', error)
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
                                            <td className="px-6 py-4 text-white">{deposit.created_at}</td>
                                            <td className="px-6 py-4 text-white">₹{deposit.amount}</td>
                                            <td className="px-6 py-4 text-white">{deposit.method}</td>
                                            <td className="px-6 py-4 text-gray-300">{deposit.transaction_id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${deposit.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : deposit.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {deposit.status}
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
