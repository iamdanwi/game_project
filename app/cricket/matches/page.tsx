"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface MarketId {
  marketId: string;
  marketName: string;
  marketStartTime: string;
  totalMatched: string;
}

interface Odds {
  runner: string;
  back: Array<{
    level: number;
    price: number;
    size: number;
  }>;
  lay: Array<{
    level: number;
    price: number;
    size: number;
  }>;
}

interface Match {
  event: {
    id: string;
    name: string;
    countryCode: string;
    timezone: string;
    openDate: string;
  };
  marketCount: number;
  marketIds: MarketId[];
  matchOdds?: Odds[];
}

export default function CricketMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isSubscribed = true
    const fetchMatchData = async () => {
      try {
        const response = await fetch('https://test.book2500.in/fetch-event-with-odds')
        const data = await response.json()

        if (!isSubscribed) return
        if (data.message === "success" && Array.isArray(data.data)) {
          setMatches(data.data)
        }
        setError(null)
      } catch (err) {
        if (!isSubscribed) return
        console.error("Error fetching matches:", err)
        setError(typeof err === 'string' ? err : "Failed to fetch matches")
      } finally {
        if (isSubscribed) {
          setLoading(false)
        }
      }
    }

    fetchMatchData()
    const interval = setInterval(fetchMatchData, 5000)

    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [])

  const renderOddsButton = (odds: { price: number; size: number }, type: 'back' | 'lay', index: number) => (
    <div
      key={`${type}-${odds.price}-${index}`}
      className={`${type === 'back' ? 'bg-blue-300/90' : 'bg-pink-300/90'
        } rounded p-2 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
    >
      <div className="font-bold">{odds.price.toFixed(2)}</div>
      <div className="text-[10px] opacity-75">{(odds.size / 1000).toFixed(1)}K</div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Match Header */}
      <div className="relative w-full h-[200px] sm:h-[250px] md:h-[400px] bg-green-900">
        <Image src="/live_cricket-bg.png" alt="Cricket Stadium" fill className="object-cover opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-black/60 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Live Matches</h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-2">Watch and bet on exciting cricket matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cricket Navigation */}
      <div className="bg-brand-darkPurple p-3 sm:p-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-red flex items-center justify-center">
                <span className="text-white text-lg sm:text-xl">🏏</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">CRICKET</span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button className="flex-1 sm:flex-initial text-sm sm:text-base bg-brand-purple border border-white">
                + LIVE
              </Button>
              <Button className="flex-1 sm:flex-initial text-sm sm:text-base bg-brand-purple border border-white">
                + VIRTUAL
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Matches List */}
      <div className="bg-brand-purple p-3 sm:p-4 flex-grow">
        <div className="container mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">IPL MATCHES</h2>

          {loading ? (
            <div className="text-center text-white py-8">Loading matches...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : matches.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No matches available</div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {matches.map((match) => (
                <div key={match.event.id} className="bg-brand-darkPurple rounded-lg overflow-hidden">
                  <div className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
                    {/* Match Info */}
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-400">
                          {new Date(match.event.openDate).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                            timeZone: 'Asia/Kolkata'
                          })} (IST)
                        </div>
                        <div className="text-base sm:text-xl font-semibold text-white">{match.event.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Markets: {match.marketCount}
                          {match.marketIds && match.marketIds[0] && (
                            <span> | {match.marketIds[0].marketName} | Matched: ₹{parseFloat(match.marketIds[0].totalMatched).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <Link href={`/cricket/live?match=${match.event.id}`}>
                        <Button className="w-full sm:w-auto bg-brand-red hover:bg-red-700 text-white">
                          PLACE BET
                        </Button>
                      </Link>
                    </div>

                    {/* Odds Display */}
                    {match.matchOdds && (
                      <div className="bg-black/20 p-3 rounded-lg">
                        <div className="grid gap-4">
                          <div className="flex justify-between text-sm">
                            <div className="w-1/3"></div>
                            <div className="w-1/3 text-center text-blue-400 font-bold">BACK</div>
                            <div className="w-1/3 text-center text-pink-400 font-bold">LAY</div>
                          </div>

                          {match.matchOdds.map((odds, idx) => (
                            <div key={`${odds.runner}-${idx}`} className="flex items-center gap-2">
                              <div className="w-1/3 text-white">{odds.runner}</div>
                              <div className="w-1/3 grid grid-cols-3 gap-1">
                                {odds.back.slice().reverse().map((back, i) =>
                                  renderOddsButton(back, 'back', i)
                                )}
                              </div>
                              <div className="w-1/3 grid grid-cols-3 gap-1">
                                {odds.lay.map((lay, i) =>
                                  renderOddsButton(lay, 'lay', i)
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

