'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    isAuthenticated: boolean
    logout: () => void
    checkAuth: () => boolean
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    logout: () => { },
    checkAuth: () => false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
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

    return (
        <AuthContext.Provider value={{ isAuthenticated, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
