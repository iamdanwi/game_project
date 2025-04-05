"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { fetchHomeData } from "@/lib/api"

interface WeeklyLeader {
  user_id: string
  total_predictions: string
  investAmount: string
  user: {
    name: string
    image_url: string
    balance: string
  }
}

export default function CricketPage() {
  const [weeklyLeaders, setWeeklyLeaders] = useState<WeeklyLeader[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await fetchHomeData()
        setWeeklyLeaders(data.weeklyLeader || [])
      } catch (error) {
        console.error("Error fetching weekly leaders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaders()
  }, [])

  return (
    <div className="flex flex-col">
      {/* Cricket Banner */}
      <div className="relative w-full h-[300px]">
        <Image src="/hero.svg" alt="Cricket Banner" fill className="object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">CRICKET</h1>
        </div>
      </div>

      {/* Top Players Section */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Play Now */}
            <div className="lg:w-1/4 flex flex-col gap-6">
              <div className="bg-brand-darkPurple rounded-lg overflow-hidden">
                <Image src="/cricket_game.svg" alt="Cricket Player" width={400} height={400} className="w-full" />
                <Link href="/cricket/matches">
                  <Button className="w-full bg-brand-red hover:bg-red-700 text-white font-bold">PLAY NOW</Button>
                </Link>
              </div>

              <div className="bg-brand-darkPurple rounded-lg p-4 text-center">
                <Link href="/app-download">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-brand-gold mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-brand-gold"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <h3 className="text-xl text-brand-gold font-bold">DOWNLOAD</h3>
                    <h3 className="text-xl text-brand-gold font-bold">OUR APP NOW!</h3>
                  </div>
                </Link>
              </div>

              <div className="bg-brand-darkPurple rounded-lg p-4">
                <h3 className="text-xl text-brand-gold font-bold mb-4 text-center">HOW TO PLAY</h3>

                <p className="text-white mb-6">
                  Cricket betting is simple. Choose a match, select your prediction (team win, player performance,
                  etc.), place your bet, and wait for the results. Remember to check odds and bet responsibly for the
                  best experience.
                </p>

                <Link href="/cricket/matches">
                  <Button className="w-full bg-brand-red hover:bg-red-700 text-white font-bold">PLAY NOW</Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Top Players */}
            <div className="lg:w-3/4">
              <div className="bg-brand-darkPurple rounded-lg overflow-hidden">
                <div className="relative bg-gradient-to-r from-purple-800 to-pink-500 p-4 rounded-t-lg">
                  <h2 className="text-2xl font-bold text-white">TOP PLAYERS</h2>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Image src="/placeholder.svg" alt="Coin" width={40} height={40} className="w-10 h-10" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold text-white mb-4">Weekly Leaders</h3>

                  <div className="grid grid-cols-1 gap-2">
                    {loading ? (
                      <div className="text-center text-gray-400 py-4">Loading...</div>
                    ) : (
                      weeklyLeaders.map((leader, index) => (
                        <div key={leader.user_id} className="flex items-center bg-brand-purple rounded p-2">
                          <div className="w-8 text-center font-bold">{index + 1}</div>
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-gold">
                            <Image
                              src={leader.user.image_url}
                              alt={`Player ${leader.user.name}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-3 flex-grow">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{leader.user.name}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Balance: ₹{parseFloat(leader.user.balance).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">Predictions: {leader.total_predictions}</div>
                            <div className="text-sm">Invested: ₹{parseFloat(leader.investAmount).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

