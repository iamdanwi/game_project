'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    isAuthenticated: boolean
    logout: () => void
    checkAuth: () => boolean
    balance: string
    updateBalance: (newBalance: string) => void
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    logout: () => { },
    checkAuth: () => false,
    balance: "0",
    updateBalance: () => { }
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [balance, setBalance] = useState("0")
    const router = useRouter()

    useEffect(() => {
        checkAuth()
        const userData = localStorage.getItem('user_data')
        if (userData) {
            const parsedData = JSON.parse(userData)
            setBalance(parsedData.balance || "0")
        }
    }, [])

    const checkAuth = () => {
        const token = localStorage.getItem('auth_token')
        const isAuth = !!token
        setIsAuthenticated(isAuth)
        return isAuth
    }

    const logout = () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        setIsAuthenticated(false)
        router.push('/login')
    }

    const updateBalance = (newBalance: string) => {
        setBalance(newBalance)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, logout, checkAuth, balance, updateBalance }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
