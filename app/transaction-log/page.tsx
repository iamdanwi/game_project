'use client'

import { useEffect, useState } from 'react'
import ProfileSidebar from "@/components/shared/ProfileSidebar"

interface Transaction {
    id: number
    trans_id: string
    description: string
    amount: string
    old_bal: string
    new_bal: string
    type: string | null
    status: string
    created_at: string
    title: string
    trx: string
    main_amo: string
    charge: string
}

interface TransactionResponse {
    page_title: string
    trans: {
        data: Transaction[]
        current_page: number
        last_page: number
        total: number
    }
    success: boolean
}

export default function TransactionLogPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTransactions()
    }, [])

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) throw new Error('Authentication required')

            const response = await fetch('https://book2500.funzip.in/api/transaction-log', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) throw new Error('Failed to fetch transactions')

            const data: TransactionResponse = await response.json()
            setTransactions(data.trans.data || [])
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
            setTransactions([])
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
                        <h1 className="text-2xl font-bold text-white mb-6">Transaction History</h1>

                        {loading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="text-white">Loading transactions...</div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-brand-purple">
                                        <tr>
                                            <th className="px-6 py-3 text-gray-300">Date</th>
                                            <th className="px-6 py-3 text-gray-300">TRX</th>
                                            <th className="px-6 py-3 text-gray-300">Amount</th>
                                            <th className="px-6 py-3 text-gray-300">Balance</th>
                                            <th className="px-6 py-3 text-gray-300">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-gray-700">
                                                <td className="px-6 py-4 text-white">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-300">{tx.trx}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${tx.type === '+'
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        ₹{tx.amount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-white">₹{tx.new_bal}</td>
                                                <td className="px-6 py-4 text-gray-300">{tx.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
