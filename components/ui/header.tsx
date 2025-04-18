'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { useBalance } from '@/context/BalanceContext'

export default function Header() {
  const { isAuthenticated, logout, checkAuth } = useAuth()
  const { balance } = useBalance()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check auth status on mount and when auth state changes
    const token = localStorage.getItem('auth_token')
    if (token) {
      checkAuth()
    }
  }, [checkAuth])

  // Listen for storage changes (login/logout events)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [checkAuth])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  const navigationLinks = [
    { href: "/", icon: "🏠", label: "HOME", color: "text-yellow-400" },
    { href: "/cricket", icon: "🏏", label: "CRICKET", color: "text-red-400" },
    { href: "/coming-soon", icon: "🎮", label: "TEEN PATTI", color: "text-pink-400" },
    { href: "/coming-soon", icon: "🎲", label: "MATAKA", color: "text-purple-400" },
    { href: "/coming-soon", icon: "✈️", label: "AVIATOR", color: "text-blue-400" },
    { href: "/coming-soon", icon: "🐉", label: "DRAGON & TIGER", color: "text-orange-400" },
    { href: "/coming-soon", icon: "♠️", label: "POKER KING", color: "text-green-400" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-brand-darkPurple">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.svg" alt="Book2500 Logo" width={180} height={60} className="w-auto h-3 sm:h-12" />
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-gray-200">
                {/* <span>₹{balance}</span> */}
              </div>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="bg-accent text-brand-purple">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="bg-brand-red hover:bg-red-700 text-white gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-brand-gold hover:bg-yellow-500 text-black">
                  Try Now
                </Button>
              </Link>
            </>
          )}

          {/* Hamburger menu for mobile */}
          <button
            className="md:hidden ml-1 sm:ml-2 p-1 sm:p-2 text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="bg-black/20 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1 px-4 py-2 whitespace-nowrap ${pathname === link.href || (link.href === "/coming-soon" && pathname === link.href)
                  ? "bg-brand-purple"
                  : ""
                  }`}
              >
                <span className={link.color}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-brand-darkPurple absolute z-50 w-full shadow-lg">
          <div className="flex flex-col">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1 px-4 py-3 border-b border-gray-700 ${pathname === link.href || (link.href === "/coming-soon" && pathname === link.href)
                  ? "bg-brand-purple"
                  : ""
                  }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={link.color}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
