import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/ui/header"
import Footer from "@/components/ui/footer"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "sonner"
import { BalanceProvider } from "@/context/BalanceContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Book2500 - Sports Betting Platform",
  description: "Book2500 is your premier destination for sports betting, casino games, and more.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BalanceProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 w-full px-4 md:px-6 mx-auto max-w-7xl">{children}</main>
              <Footer />
            </div>
          </BalanceProvider>
        </AuthProvider>
        <Toaster richColors expand={true} position="top-center" />
      </body>
    </html>
  )
}