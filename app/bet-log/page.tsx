'use client'

import { useEffect, useState } from 'react'
import ProfileSidebar from "@/components/shared/ProfileSidebar"
import { getBetHistory } from '@/lib/api'

interface BetLog {
    id: string
    match_name: string
    bet_type: string
    amount: string
    potential_return: string
    status: 'win' | 'loss' | 'pending'
    placed_at: string
}

export default function BetLogPage() {
    const [bets, setBets] = useState<BetLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBetHistory()
    }, [])

    const fetchBetHistory = async () => {
        try {
            const response = await getBetHistory()
            setBets(response.data?.logs || [])
        } catch (error) {
            console.error('Failed to fetch bet history:', error)
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
                        <h1 className="text-2xl font-bold text-white mb-6">Bet History</h1>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-brand-purple">
                                    <tr>
                                        <th className="px-6 py-3 text-gray-300">Date</th>
                                        <th className="px-6 py-3 text-gray-300">Match</th>
                                        <th className="px-6 py-3 text-gray-300">Bet Type</th>
                                        <th className="px-6 py-3 text-gray-300">Amount</th>
                                        <th className="px-6 py-3 text-gray-300">Potential Return</th>
                                        <th className="px-6 py-3 text-gray-300">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bets.map((bet) => (
                                        <tr key={bet.id} className="border-b border-gray-700">
                                            <td className="px-6 py-4 text-white">{bet.placed_at}</td>
                                            <td className="px-6 py-4 text-white">{bet.match_name}</td>
                                            <td className="px-6 py-4 text-white">{bet.bet_type}</td>
                                            <td className="px-6 py-4 text-white">₹{bet.amount}</td>
                                            <td className="px-6 py-4 text-white">₹{bet.potential_return}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${bet.status === 'win'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : bet.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {bet.status.toUpperCase()}
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
