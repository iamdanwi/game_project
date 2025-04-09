'use client'
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSlider from "@/components/ui/hero-slider"
import GameCard from "@/components/ui/game-card"
import { useEffect, useState } from 'react'

interface EventData {
  event: {
    id: string
    name: string
    openDate: string
    countryCode: string
  }
  marketCount: number
  marketIds: Array<{
    marketId: string
    marketName: string
    totalMatched: string
  }>
  odds?: {
    eventName: string
    runners: Array<{
      selectionId: number
      runner: string
      ex: {
        availableToBack: Array<{ price: number; size: number }>
        availableToLay: Array<{ price: number; size: number }>
      }
    }>
  }
}

export default function Home() {
  const [matches, setMatches] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventsAndOdds = async () => {
      try {
        const response = await fetch("https://test.book2500.in/fetch-event/")
        const json = await response.json()
        const data: EventData[] = json.data

        const matchesWithOdds = await Promise.all(
          data.slice(0, 3).map(async (match) => {
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

    fetchEventsAndOdds()
    const interval = setInterval(fetchEventsAndOdds, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col">
      <HeroSlider />

      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 justify-items-center">
            <Link href="/cricket" className="game-card block text-center">
              <div className="rounded-full overflow-hidden w-24 h-24 md:w-32 md:h-32 mx-auto">
                <Image
                  src="/games/cricket.svg"
                  alt="CRICKET"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="mt-2 text-xs md:text-sm uppercase font-bold text-center">CRICKET</h3>
            </Link>
            <GameCard title="AVIATOR" imageSrc="/games/aviator.svg" href="/coming-soon" />
            <GameCard title="DRAGON VS TIGER" imageSrc="/games/dragon.svg" href="/coming-soon" />
            <GameCard title="TEEN PATTI" imageSrc="/games/teenPatti.svg" href="/coming-soon" />
            <GameCard title="MATAKA" imageSrc="/games/mataka.svg" href="/coming-soon" />
            <GameCard title="POKER KING" imageSrc="/games/poker.svg" href="/coming-soon" />
          </div>
        </div>
      </section>

      <section className="py-10 bg-brand-darkPurple">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/5 lg:w-1/3">
              <Image
                src="/winner.svg"
                alt="Winner"
                width={500}
                height={600}
                className="w-full h-auto max-h-[800px] object-contain mx-auto"
                priority
              />
            </div>
            <div className="w-full md:w-3/5 lg:w-2/3 space-y-4">
              {matches.map((match) => (
                <Link
                  key={match.event.id}
                  href={`/cricket/live?match=${match.event.id}&market=${match.marketIds[0]?.marketId}`}
                  className="block bg-brand-darkPurple rounded-lg overflow-hidden hover:bg-brand-purple/20 transition-colors"
                >
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
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded self-start sm:self-center">
                        LIVE
                      </span>
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
                                {/* Back odds */}
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
                                {/* Lay odds */}
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
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Link href="/app-download" className="w-full max-w-md">
              <Button className="w-full bg-transparent border-2 border-brand-gold text-brand-gold hover:bg-brand-gold/10 font-bold text-xl py-4 rounded-full flex items-center justify-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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
                DOWNLOAD OUR APP NOW!
              </Button>
            </Link>

            <Link href="/cricket" className="w-full max-w-md">
              <Button className="w-full bg-brand-red hover:bg-red-700 text-white font-bold text-xl py-4">
                BET NOW & WIN
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

