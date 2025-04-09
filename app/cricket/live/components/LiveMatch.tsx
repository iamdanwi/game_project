"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Runner } from "@/lib/types"
import { createPrediction } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { useBalance } from "@/context/BalanceContext"

interface SelectedBet {
    name: string
    type: string
    section: string
    selectionId?: number
}

const MIN_STAKE = 100
const MAX_STAKE = 250000
const predefinedStakes = [
    [100, 500, 1000, 2000],
    [5000, 10000, 25000, 50000],
]

interface BookmakerMarket {
    marketId: string
    evid: string
    inplay: boolean
    mname: string
    min: string
    max: string
    rem: string
    runners: BookmakerRunner[]
    status: string
}

interface BookmakerRunner {
    selectionId: number
    runnerName: string
    status: string
    lastPriceTraded: number
    totalMatched: number
    batb: Array<[number, number]>
    batl: Array<[number, number]>
}

interface FancyOdds {
    RunnerName: string
    BackPrice1: number
    BackSize1: number
    LayPrice1: number
    LaySize1: number
    isSuspended?: boolean
    slidingText?: string
}

export default function LiveMatch() {
    const router = useRouter()
    const { isAuthenticated } = useAuth()
    const { updateBalance } = useBalance()
    const [selectedBet, setSelectedBet] = useState<SelectedBet | null>(null)
    const [selectedOdds, setSelectedOdds] = useState("")
    const [selectedStake, setSelectedStake] = useState("")
    const [eventOdds, setEventOdds] = useState<{ eventName: string; runners: Runner[] }>({ eventName: "", runners: [] })
    const [fancyOdds, setFancyOdds] = useState<FancyOdds[]>([])
    const [bookmakerMarket, setBookmakerMarket] = useState<BookmakerMarket | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [betError, setBetError] = useState<string | null>(null)
    const [userBalance, setUserBalance] = useState<string>("0")
    const [showMobileBetForm, setShowMobileBetForm] = useState(false)

    const searchParams = useSearchParams()
    const eventId = searchParams.get("match")
    const marketId = searchParams.get("market")

    const updateUserBalance = async () => {
        try {
            const userData = localStorage.getItem('user_data')
            if (userData) {
                const parsedData = JSON.parse(userData)
                setUserBalance(parsedData.balance || "0")
            }
        } catch (error) {
            console.error("Error updating balance:", error)
        }
    }

    useEffect(() => {
        updateUserBalance()
    }, [])

    const handleStakeButton = (type: "min" | "max") => {
        setSelectedStake(type === "min" ? MIN_STAKE.toString() : MAX_STAKE.toString())
    }

    const handleClearStake = () => {
        setSelectedStake("")
        setSelectedOdds("")
    }

    const handlePlaceBet = async () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            toast.error("Please login to place bets")
            router.push('/login')
            return
        }

        setBetError(null)

        if (!selectedBet || !selectedOdds || !selectedStake) {
            setBetError("Please select odds and enter stake amount")
            return
        }

        const stakeAmount = Number.parseFloat(selectedStake)
        if (isNaN(stakeAmount) || stakeAmount < MIN_STAKE || stakeAmount > MAX_STAKE) {
            setBetError(`Stake must be between ${MIN_STAKE} and ${MAX_STAKE}`)
            return
        }

        const currentBalance = Number.parseFloat(userBalance)
        if (isNaN(currentBalance) || currentBalance < stakeAmount) {
            toast.error("Insufficient balance", {
                description: "Please add funds to your account"
            })
            return
        }

        try {
            const predictionData = {
                invested_amount: stakeAmount,
                event_id: eventId!,
                market_id: marketId!,
                selection_id: selectedBet.selectionId?.toString() || "",
                type: "event-odds",  // Fixed type value
                is_back: selectedBet.type === 'BACK',
                ratio: Number(selectedOdds),
                level: 1,
                bet_category: selectedBet.section.toLowerCase(),
                match_name: eventOdds.eventName,
                runner_name: selectedBet.name
            }

            const response = await createPrediction(predictionData)

            if (response.success) {
                const newBalance = (Number(userBalance) - Number(selectedStake)).toString()
                updateBalance(newBalance)
                setUserBalance(newBalance)

                toast("Bet Placed Successfully!", {
                    description: `${selectedBet?.name} - ₹${selectedStake} @ ${selectedOdds}`,
                    action: {
                        label: "View Bets",
                        onClick: () => router.push('/bet-log')
                    },
                })
                handleClearStake()
                setSelectedBet(null)
            } else {
                toast.error("Failed to place bet", {
                    description: response.message || "Please try again"
                })
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to place bet. Please try again."
            })
        }
    }

    const isValidRunner = (runner: Runner): boolean => {
        return !!(runner && runner.ex && (runner.ex.availableToBack?.length || runner.ex.availableToLay?.length))
    }

    const handleOddsClick = (
        runner: any,
        type: "back" | "lay" | "no" | "yes",
        section: "match" | "bookmaker" | "fancy",
    ) => {
        setBetError(null)

        try {
            let oddsValue = ""
            let size = 0

            if (section === "match") {
                if (!runner.ex) return
                const odds = type === "back" ? runner.ex.availableToBack?.[0] : runner.ex.availableToLay?.[0]
                if (!odds || typeof odds.price !== "number" || odds.price <= 0) {
                    setBetError("Invalid odds data for match bet")
                    return
                }
                oddsValue = odds.price.toFixed(2)
                size = odds.size
            } else if (section === "bookmaker") {
                const price = type === "back" ? runner.batb?.[0]?.[0] : runner.batl?.[0]?.[0]
                const betSize = type === "back" ? runner.batb?.[0]?.[1] : runner.batl?.[0]?.[1]
                if (!price || price <= 0) {
                    setBetError("Invalid odds data for bookmaker bet")
                    return
                }
                oddsValue = price.toFixed(2)
                size = betSize
            } else if (section === "fancy") {
                if (runner.isSuspended) {
                    setBetError("This market is currently suspended")
                    return
                }
                const price = type === "no" ? runner.BackPrice1 : runner.LayPrice1
                const betSize = type === "no" ? runner.BackSize1 : runner.LaySize1
                if (!price || price <= 0) {
                    setBetError("Invalid odds data for fancy bet")
                    return
                }
                oddsValue = price.toFixed(2)
                size = betSize
            }

            setSelectedBet({
                name: runner.runner || runner.RunnerName,
                type: type.toUpperCase(),
                section: section.toUpperCase(),
                selectionId: runner.selectionId || runner.SelectionId
            })
            setSelectedOdds(oddsValue)
            setSelectedStake("")
            setShowMobileBetForm(true)
        } catch (error) {
            console.error("Error processing odds:", error)
            setBetError("Failed to process odds. Please try again.")
        }
    }

    const fetchOddsData = async () => {
        if (!eventId || !marketId) {
            setError("Missing event or market ID in URL.")
            return
        }

        try {
            const [eventRes, fancyRes, bookmakerRes] = await Promise.all([
                fetch(`https://test.book2500.in/fetch-event-odds/${eventId}/${marketId}`).then((res) => res.json()),
                fetch(`https://test.book2500.in/fetch-fancy-odds/${eventId}/${marketId}`).then((res) => res.json()),
                fetch(`https://test.book2500.in/fetch-bookmaker-odds/${eventId}/${marketId}`).then((res) => res.json()),
            ])

            if (eventRes?.data) {
                setEventOdds({
                    eventName: eventRes.data.eventName || "",
                    runners: eventRes.data.runners || [],
                })
            }

            setFancyOdds(Array.isArray(fancyRes?.data) ? fancyRes.data : [])
            if (bookmakerRes?.data) {
                setBookmakerMarket(bookmakerRes.data)
            }
            setError(null)
        } catch (err) {
            console.error(err)
            setError("Failed to fetch odds data.")
        }
    }

    useEffect(() => {
        fetchOddsData()
        const interval = setInterval(fetchOddsData, 1000)
        return () => clearInterval(interval)
    }, [eventId, marketId])

    if (error)
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-purple">
                <div className="text-red-400 text-xl">{error}</div>
            </div>
        )

    return (
        <div className="min-h-screen bg-brand-purple p-2 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-4">
                {/* Betting Panel for Mobile - Fixed at Bottom */}
                <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ${showMobileBetForm ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="bg-gradient-to-t from-black via-gray-900 to-transparent p-2">
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-3 shadow-xl border border-gray-700">
                            {/* Close button */}
                            <button
                                className="absolute top-1 right-1 text-gray-400 hover:text-white p-2"
                                onClick={() => setShowMobileBetForm(false)}
                            >
                                ✕
                            </button>

                            {/* Compact Betting Panel for Mobile */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-white text-sm truncate flex-1">
                                    {selectedBet ? (
                                        <span>
                                            {selectedBet.name} - {selectedBet.type}
                                        </span>
                                    ) : (
                                        "Select a bet"
                                    )}
                                </div>
                                <div className="text-gray-300 text-sm ml-2">
                                    ₹{userBalance}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <Input
                                    type="number"
                                    value={selectedOdds}
                                    onChange={(e) => setSelectedOdds(e.target.value)}
                                    className="bg-gray-700 text-white text-sm"
                                    placeholder="Odds"
                                />
                                <Input
                                    type="number"
                                    value={selectedStake}
                                    onChange={(e) => setSelectedStake(e.target.value)}
                                    className="bg-gray-700 text-white text-sm"
                                    placeholder="Stakes"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="default"
                                    className="bg-gray-600 text-white flex-1 text-sm"
                                    onClick={handleClearStake}
                                >
                                    Clear
                                </Button>
                                <Button
                                    variant="default"
                                    className="bg-brand-green text-white flex-1 text-sm"
                                    onClick={handlePlaceBet}
                                    disabled={!selectedBet || !selectedOdds || !selectedStake}
                                >
                                    Place Bet
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 pb-[120px] lg:pb-0">
                    {/* Left Side - Match Data */}
                    <div className="flex-1 space-y-6">
                        {/* Header */}
                        <div className="bg-brand-darkPurple rounded-lg p-4">
                            <h1 className="text-2xl font-bold text-brand-gold">{eventOdds.eventName || "Live Match"}</h1>
                        </div>

                        {/* Match Odds Section */}
                        <div className="bg-brand-darkPurple rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-pink-500 p-3 sm:p-4">
                                <h2 className="text-lg sm:text-xl font-bold text-white">MATCH ODDS</h2>
                                <Button className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">CASHOUT</Button>
                            </div>
                            <div className="p-4 text-sm">
                                <div className="text-gray-400 mb-2">
                                    Min: {MIN_STAKE} | Max: {MAX_STAKE}
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-center text-blue-400 font-bold">BACK</div>
                                    <div className="text-center text-pink-400 font-bold">LAY</div>
                                </div>
                                {eventOdds.runners?.map((runner, idx) => (
                                    <div key={idx} className="mb-6 last:mb-0">
                                        <div className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{runner.runner}</div>
                                        <div className="grid grid-cols-6 gap-1 sm:gap-2">
                                            {[2, 1, 0].map((i) => (
                                                <div
                                                    key={`back-${i}`}
                                                    onClick={() => handleOddsClick(runner, "back", "match")}
                                                    className={`relative bg-blue-300/90 rounded p-1 sm:p-2 text-center text-white hover:bg-blue-400/90 ${(runner.ex?.availableToBack?.[i]?.price ?? 0) > 0 ? "hover:bg-blue-600/30 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                                >
                                                    <div className="text-white font-bold">
                                                        {(runner.ex?.availableToBack?.[i]?.price ?? 0).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-200">
                                                        {runner.ex?.availableToBack?.[i]?.size.toLocaleString() || "0"}
                                                    </div>
                                                    {(!runner.ex?.availableToBack?.[i]?.price || runner.ex?.availableToBack?.[i]?.price === 0) && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded text-xs text-white">
                                                            SUSPENDED
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={`lay-${i}`}
                                                    onClick={() => handleOddsClick(runner, "lay", "match")}
                                                    className={`relative bg-pink-300/90 rounded p-1 sm:p-2 text-center text-white hover:bg-pink-400/90 ${(runner.ex?.availableToLay?.[i]?.price ?? 0) > 0 ? "hover:bg-pink-600/30 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                                >
                                                    <div className="text-white font-bold">
                                                        {runner.ex?.availableToLay?.[i]?.price.toFixed(2) || "-"}
                                                    </div>
                                                    <div className="text-xs text-gray-200">
                                                        {runner.ex?.availableToLay?.[i]?.size.toLocaleString() || "0"}
                                                    </div>
                                                    {(!runner.ex?.availableToLay?.[i]?.price || runner.ex?.availableToLay?.[i]?.price === 0) && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded text-xs text-white">
                                                            SUSPENDED
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bookmaker Section */}
                        <div className="bg-brand-darkPurple rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-pink-500 p-3 sm:p-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white">{bookmakerMarket?.mname || "BOOKMAKER"}</h2>
                                    {bookmakerMarket?.rem && (
                                        <p className="text-xs text-gray-300 mt-1">{bookmakerMarket.rem}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {bookmakerMarket?.inplay && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Live</span>
                                    )}
                                    <Button className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">CASHOUT</Button>
                                </div>
                            </div>
                            <div className="p-4 text-sm">
                                <div className="text-gray-400 mb-2">
                                    Min: {bookmakerMarket?.min || MIN_STAKE} | Max: {bookmakerMarket?.max || MAX_STAKE}
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                                    <div className="text-center text-blue-400 font-bold">BACK</div>
                                    <div className="text-center text-pink-400 font-bold">LAY</div>
                                </div>
                                {(bookmakerMarket?.runners || []).map((runner, idx) => (
                                    <div key={idx} className="mb-6 last:mb-0">
                                        <div className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                                            {runner.runnerName}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            <div
                                                className={`relative bg-blue-300/90 rounded p-1 sm:p-2 text-center text-white hover:bg-blue-400/90 ${(runner.batb?.[0]?.[0] ?? 0) > 0 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                            >
                                                <div className="text-white font-bold">
                                                    {runner.batb?.[0]?.[0] || "-"}
                                                </div>
                                                <div className="text-xs text-gray-200">
                                                    {runner.batb?.[0]?.[1]?.toLocaleString() || "0"}
                                                </div>
                                                {(!runner.batb?.[0]?.[0] || runner.batb?.[0]?.[0] === 0) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded text-xs text-white">
                                                        SUSPENDED
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                className={`relative bg-pink-300/90 rounded p-1 sm:p-2 text-center text-white hover:bg-pink-400/90 ${(runner.batl?.[0]?.[0] ?? 0) > 0 ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
                                            >
                                                <div className="text-white font-bold">
                                                    {runner.batl?.[0]?.[0] || "-"}
                                                </div>
                                                <div className="text-xs text-gray-200">
                                                    {runner.batl?.[0]?.[1]?.toLocaleString() || "0"}
                                                </div>
                                                {(!runner.batl?.[0]?.[0] || runner.batl?.[0]?.[0] === 0) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded text-xs text-white">
                                                        SUSPENDED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fancy Section */}
                        <div className="bg-brand-darkPurple rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between bg-gradient-to-r from-purple-800 to-pink-500 p-3 sm:p-4">
                                <h2 className="text-lg sm:text-xl font-bold text-white">FANCY</h2>
                                <Button className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm">CASHOUT</Button>
                            </div>
                            <div className="p-4 text-sm">
                                <div className="text-gray-400 mb-2">
                                    Min: {MIN_STAKE} | Max: {MAX_STAKE}
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
                                    <div className="text-center text-blue-400 font-bold">NO</div>
                                    <div className="text-center text-pink-400 font-bold">YES</div>
                                </div>
                                {fancyOdds.map((odd, idx) => (
                                    <div key={idx} className="mb-6 last:mb-0">
                                        <div className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{odd.RunnerName}</div>
                                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                            <div
                                                onClick={() => handleOddsClick(odd, "no", "fancy")}
                                                className={`relative bg-blue-300/90 rounded p-1 sm:p-2 text-center text-white hover:bg-blue-400/90 ${odd.isSuspended || odd.BackPrice1 <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                <div className="text-white font-bold">{odd.BackPrice1}</div>
                                                <div className="text-xs text-gray-200">{odd.BackSize1.toLocaleString()}</div>
                                                {(odd.isSuspended || !odd.BackPrice1 || odd.BackPrice1 === 0) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded text-xs text-white">
                                                        SUSPENDED
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                onClick={() => handleOddsClick(odd, "yes", "fancy")}
                                                className={`relative bg-pink-300/90 rounded p-1 sm:p-2 text-center text-white hover:bg-pink-400/90 ${odd.isSuspended || odd.LayPrice1 <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                <div className="text-white font-bold">{odd.LayPrice1}</div>
                                                <div className="text-xs text-gray-200">{odd.LaySize1.toLocaleString()}</div>
                                                {(odd.isSuspended || !odd.LayPrice1 || odd.LayPrice1 === 0) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded text-xs text-white">
                                                        SUSPENDED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {odd.slidingText && <div className="text-xs text-gray-300 mt-1">{odd.slidingText}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Desktop Betting Panel */}
                    <div className="hidden lg:block w-[400px]">
                        <div className="sticky top-4 lg:top-24">
                            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-3 sm:p-4 shadow-xl border border-gray-700">
                                {/* Betting Panel Header */}
                                <div className="flex justify-between items-center mb-3 sm:mb-4">
                                    <div className="text-white">
                                        <div className="font-bold text-base sm:text-lg">{eventOdds.eventName}</div>
                                        <div className="text-gray-300 text-sm">
                                            {selectedBet ? (
                                                <span>
                                                    {selectedBet.name} - {selectedBet.type} ({selectedBet.section})
                                                </span>
                                            ) : (
                                                "Select a bet"
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        Balance: ₹{userBalance}
                                    </div>
                                </div>

                                {/* Odds and Stakes Inputs */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-300 mb-1">Odds</div>
                                        <Input
                                            type="number"
                                            value={selectedOdds}
                                            onChange={(e) => setSelectedOdds(e.target.value)}
                                            className="w-full bg-gray-700 text-white border-gray-600 focus:border-brand-gold"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-300 mb-1">Stakes</div>
                                        <Input
                                            type="number"
                                            value={selectedStake}
                                            onChange={(e) => setSelectedStake(e.target.value)}
                                            className="w-full bg-gray-700 text-white border-gray-600 focus:border-brand-gold"
                                        />
                                    </div>
                                </div>

                                {/* Predefined Stakes Grid */}
                                {predefinedStakes.map((row, rowIndex) => (
                                    <div key={rowIndex} className="grid grid-cols-4 gap-1 sm:gap-2 mb-3 sm:mb-4">
                                        {row.map((stake, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedStake(stake.toString())}
                                                className="bg-gray-700 hover:bg-gray-600 text-white p-1 sm:p-2 text-center text-xs sm:text-sm rounded transition-colors"
                                            >
                                                {stake}
                                            </button>
                                        ))}
                                    </div>
                                ))}

                                {/* Control Buttons */}
                                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-3 sm:mb-4">
                                    <Button
                                        variant="default"
                                        className="bg-brand-gold hover:bg-yellow-500 text-black font-bold"
                                        onClick={() => handleStakeButton("min")}
                                    >
                                        MIN
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold"
                                        onClick={() => handleStakeButton("max")}
                                    >
                                        MAX
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold"
                                        onClick={handleClearStake}
                                    >
                                        CLEAR
                                    </Button>
                                </div>

                                {/* Betting Panel Content */}
                                {betError && <div className="text-red-500 text-sm mb-4">{betError}</div>}

                                {/* Action Buttons */}
                                <div className="flex justify-between gap-1 sm:gap-2">
                                    <Button
                                        variant="default"
                                        className="bg-gray-600 hover:bg-gray-700 text-white flex-1 font-bold"
                                        onClick={handleClearStake}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="bg-brand-green hover:bg-green-600 text-white flex-1 font-bold"
                                        onClick={handlePlaceBet}
                                        disabled={!selectedBet || !selectedOdds || !selectedStake}
                                    >
                                        Place Bet
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
