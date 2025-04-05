"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    <header className="w-full bg-brand-darkPurple">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.svg" alt="Book2500 Logo" width={180} height={60} className="w-auto h-12" />
          </Link>

          <div className="flex gap-2">
            <Link href="/register">
              <Button className="bg-brand-red hover:bg-red-700 text-white font-bold">TRY NOW</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-brand-green hover:bg-green-700 text-white font-bold">LOG IN</Button>
            </Link>

            {/* Hamburger menu for mobile */}
            <button className="md:hidden ml-2 p-2 text-white" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
                className={`flex items-center gap-1 px-4 py-2 whitespace-nowrap ${(pathname === link.href ||
                    (link.href === "/coming-soon" && pathname === link.href))
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
                className={`flex items-center gap-1 px-4 py-3 border-b border-gray-700 ${(pathname === link.href ||
                    (link.href === "/coming-soon" && pathname === link.href))
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

