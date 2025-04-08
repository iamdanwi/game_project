"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface EventData {
  event: {
    id: string
    name: string
    countryCode: string
    timezone: string
    openDate: string
  }
  bfid: string
  marketCount: number
  marketIds: Array<{
    marketId: string
    marketName: string
    marketStartTime: string
    totalMatched: string
  }>
  scoreboard_id: string
  selections: string
  liability_type: number
  undeclared_markets: number
  odds?: {
    runners: Array<{
      selectionId: string
      runner: string
      ex?: {
        availableToBack?: Array<{ price: number; size: number }>
        availableToLay?: Array<{ price: number; size: number }>
      }
    }>
  }
}

export default function CricketMatchesPage() {
  const [matches, setMatches] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEventsAndOdds = async () => {
    try {
      const response = await fetch("https://test.book2500.in/fetch-event/")
      const json = await response.json()

      const data: EventData[] = json.data

      const matchesWithOdds = await Promise.all(
        data.map(async (match) => {
          if (!match.marketIds?.length) return match

          const marketId = match.marketIds[0].marketId
          try {
            const oddsResponse = await fetch(`https://test.book2500.in/fetch-event-odds/${match.event.id}/${marketId}`)
            const oddsData = await oddsResponse.json()
            return { ...match, odds: oddsData.data }
          } catch (err) {
            console.error(`Error fetching odds for ${match.event.id}`, err)
            return match
          }
        }),
      )

      setMatches(matchesWithOdds)
      setError(null)
    } catch (err) {
      console.error("Error fetching matches", err)
      setError("Failed to fetch matches")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventsAndOdds()
    const interval = setInterval(fetchEventsAndOdds, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="relative w-full h-[150px] sm:h-[200px] md:h-[300px] lg:h-[400px] bg-green-900">
        <Image src="/live_cricket-bg.png" alt="Cricket Stadium" fill className="object-cover opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-black/60 p-3 sm:p-4 md:p-6 rounded-xl backdrop-blur-sm text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">Live Matches</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mt-1 sm:mt-2">
              Watch and bet on exciting cricket matches
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-brand-darkPurple p-2 sm:p-3 md:p-4">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-brand-red flex items-center justify-center">
              <span className="text-white text-sm sm:text-lg md:text-xl">🏏</span>
            </div>
            <span className="text-base sm:text-lg md:text-xl font-bold text-white">CRICKET</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button className="flex-1 sm:flex-initial text-xs sm:text-sm md:text-base bg-brand-purple border border-white py-1 px-2 sm:py-2 sm:px-3 h-auto">
              + LIVE
            </Button>
            <Button className="flex-1 sm:flex-initial text-xs sm:text-sm md:text-base bg-brand-purple border border-white py-1 px-2 sm:py-2 sm:px-3 h-auto">
              + VIRTUAL
            </Button>
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="bg-brand-purple p-2 sm:p-3 md:p-4 flex-grow">
        <div className="container mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6">LIVE</h2>

          {loading ? (
            <div className="text-center text-white py-8">Loading matches...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-8">{error}</div>
          ) : matches.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No matches available</div>
          ) : (
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {matches.map((match) => (
                <div key={match.event.id} className="bg-brand-darkPurple rounded-lg overflow-hidden">
                  <div className="p-2 sm:p-3 md:p-4 flex flex-col gap-2 sm:gap-3 md:gap-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
                      <div>
                        <div className="text-xs text-gray-400">
                          {new Date(match.event.openDate).toLocaleString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })}{" "}
                          (IST)
                        </div>
                        <div className="text-sm sm:text-base md:text-xl font-semibold text-white">
                          {match.event.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Markets: {match.marketCount} | Country: {match.event.countryCode}
                          {match.marketIds.length > 0 && (
                            <span className="hidden sm:inline">
                              {" "}
                              | Market: {match.marketIds[0].marketName} | Matched: ₹
                              {Number.parseFloat(match.marketIds[0].totalMatched).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/cricket/live?match=${match.event.id}&market=${match.marketIds[0]?.marketId}`}
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto bg-brand-purple border border-white text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 h-auto">
                          + LIVE
                        </Button>
                      </Link>
                    </div>

                    {/* Market Odds */}
                    <div className="p-1 sm:p-2 rounded overflow-hidden text-xs bg-black/20">
                      {"odds" in match && Array.isArray(match.odds?.runners) && match.odds.runners.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center mb-1 sm:mb-2">
                            <div className="text-blue-400 font-bold">BACK</div>
                            <div className="text-pink-400 font-bold">LAY</div>
                          </div>
                          {match.odds.runners.map((runner) => (
                            <div key={runner.selectionId} className="mb-1 sm:mb-2 last:mb-0">
                              <div className="text-white mb-1 font-medium text-xs sm:text-sm">{runner.runner}</div>
                              <div className="grid grid-cols-6 gap-1">
                                {[2, 1, 0].map((index) => (
                                  <div
                                    key={`back-${index}`}
                                    className="bg-blue-300/90 rounded p-1 sm:p-2 text-center hover:bg-blue-400/90"
                                  >
                                    {runner.ex?.availableToBack?.[index] ? (
                                      <>
                                        <div className="font-bold text-xs sm:text-sm">
                                          {runner.ex.availableToBack[index].price.toFixed(2)}
                                        </div>
                                        <div className="text-[8px] sm:text-[10px] opacity-75">
                                          {(runner.ex.availableToBack[index].size / 1000).toFixed(1)}K
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-bold text-xs sm:text-sm">-</div>
                                        <div className="text-[8px] sm:text-[10px] opacity-75">0.0</div>
                                      </>
                                    )}
                                  </div>
                                ))}
                                {[0, 1, 2].map((index) => (
                                  <div
                                    key={`lay-${index}`}
                                    className="bg-pink-300/90 rounded p-1 sm:p-2 text-center hover:bg-pink-400/90"
                                  >
                                    {runner.ex?.availableToLay?.[index] ? (
                                      <>
                                        <div className="font-bold text-xs sm:text-sm">
                                          {runner.ex.availableToLay[index].price.toFixed(2)}
                                        </div>
                                        <div className="text-[8px] sm:text-[10px] opacity-75">
                                          {(runner.ex.availableToLay[index].size / 1000).toFixed(1)}K
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-bold text-xs sm:text-sm">-</div>
                                        <div className="text-[8px] sm:text-[10px] opacity-75">0.0</div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="text-center text-gray-400 py-2">No market data available</div>
                      )}
                    </div>
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
