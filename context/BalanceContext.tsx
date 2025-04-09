'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface BalanceContextType {
    balance: string
    updateBalance: (newBalance: string) => void
}

const BalanceContext = createContext<BalanceContextType>({
    balance: '0',
    updateBalance: () => { },
})

export function BalanceProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState('0')

    useEffect(() => {
        const userData = localStorage.getItem('user_data')
        if (userData) {
            const parsedData = JSON.parse(userData)
            setBalance(parsedData.balance || '0')
        }
    }, [])

    const updateBalance = (newBalance: string) => {
        setBalance(newBalance)
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
        userData.balance = newBalance
        localStorage.setItem('user_data', JSON.stringify(userData))
    }

    return (
        <BalanceContext.Provider value={{ balance, updateBalance }}>
            {children}
        </BalanceContext.Provider>
    )
}

export const useBalance = () => useContext(BalanceContext)
