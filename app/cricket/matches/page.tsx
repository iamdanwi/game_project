"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { fetchEvents, fetchEventOdds } from "@/lib/api"
import type { EventData } from "@/lib/types"

export default function CricketMatchesPage() {
  const [matches, setMatches] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isSubscribed = true
    const fetchMatchData = async () => {
      try {
        const data = await fetchEvents()
        if (!isSubscribed) return

        const matchesWithOdds = await Promise.all(
          data.map(async (match) => {
            if (!match.marketIds?.length) return match

            const marketId = match.marketIds[0].marketId
            try {
              const odds = await fetchEventOdds(match.event.id, marketId)
              return { ...match, odds }
            } catch (error) {
              console.error(`Error fetching odds for match ${match.event.id}:`, error)
              return match
            }
          })
        )

        if (!isSubscribed) return
        setMatches(matchesWithOdds)
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
    const interval = setInterval(fetchMatchData, 5000) // Update every 5 seconds

    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [])

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
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">LIVE</h2>

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
                    <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
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
                          Markets: {match.marketCount} | Country: {match.event.countryCode}
                          {match.marketIds.length > 0 && (
                            <span> | Market: {match.marketIds[0].marketName} | Matched: ₹{parseFloat(match.marketIds[0].totalMatched).toLocaleString()}</span>
                          )}
                        </div>
                      </div>

                      <Link href={`/cricket/live?match=${match.event.id}`} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-brand-purple border border-white text-sm sm:text-base">
                          + LIVE
                        </Button>
                      </Link>
                    </div>

                    {/* Market Info */}
                    <div className="p-2 rounded overflow-hidden text-xs sm:text-sm bg-black/20">
                      {'odds' in match && Array.isArray(match.odds?.runners) && match.odds.runners.length > 0 ? (
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-blue-400 font-bold">BACK</div>
                            <div className="text-pink-400 font-bold">LAY</div>
                          </div>
                          {match.odds.runners.map((runner) => (
                            <div key={runner.selectionId} className="mb-2 last:mb-0">
                              <div className="text-white mb-1 font-medium">{runner.runner}</div>
                              <div className="grid grid-cols-6 gap-1">
                                {/* Back odds */}
                                {[2, 1, 0].map((index) => (
                                  <div
                                    key={`back-${index}`}
                                    className="bg-blue-300/90 rounded p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-400/90 transition-colors"
                                    title={`Back: ${runner.runner}`}
                                  >
                                    {runner.ex?.availableToBack?.[index] ? (
                                      <>
                                        <div className="font-bold">
                                          {runner.ex.availableToBack[index].price.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] opacity-75">
                                          {(runner.ex.availableToBack[index].size / 1000).toFixed(1)}K
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-bold">-</div>
                                        <div className="text-[10px] opacity-75">0.0</div>
                                      </>
                                    )}
                                  </div>
                                ))}

                                {/* Lay odds */}
                                {[0, 1, 2].map((index) => (
                                  <div
                                    key={`lay-${index}`}
                                    className="bg-pink-300/90 rounded p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-400/90 transition-colors"
                                    title={`Lay: ${runner.runner}`}
                                  >
                                    {runner.ex?.availableToLay?.[index] ? (
                                      <>
                                        <div className="font-bold">
                                          {runner.ex.availableToLay[index].price.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] opacity-75">
                                          {(runner.ex.availableToLay[index].size / 1000).toFixed(1)}K
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-bold">-</div>
                                        <div className="text-[10px] opacity-75">0.0</div>
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

