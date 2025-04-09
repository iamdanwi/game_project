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

import { useIsMobile } from "@/components/ui/use-mobile"

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

const getMobileBetFormStyle = (isVisible: boolean) => ({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "1rem",
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
    zIndex: 50,
    transform: isVisible ? "translateY(0)" : "translateY(100%)",
    transition: "transform 0.3s ease-in-out",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem"
}) as const

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
    const isMobile = useIsMobile()
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
    const [expandedSections, setExpandedSections] = useState({
        matchOdds: true,
        bookmaker: true,
        fancy: true
    })

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

    const handleStakeButton = (type: "min" | "max" | "predefined", value?: number) => {
        if (type === "predefined" && value) {
            setSelectedStake(value.toString())
        } else {
            setSelectedStake(type === "min" ? MIN_STAKE.toString() : MAX_STAKE.toString())
        }
    }

    const handleClearStake = () => {
        setSelectedStake("")
        setSelectedOdds("")
    }

    const toggleSection = (section: 'matchOdds' | 'bookmaker' | 'fancy') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
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
                setShowMobileBetForm(false)
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
                const price = type === "back" ? runner.batb?.[0]?.[0]?.[0] : runner.batl?.[0]?.[0]?.[0]
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
                name: runner.runner || runner.RunnerName || runner.runnerName,
                type: type.toUpperCase(),
                section: section.toUpperCase(),
                selectionId: runner.selectionId || runner.SelectionId
            })
            setSelectedOdds(oddsValue)
            setSelectedStake("")
            if (isMobile) {
                setShowMobileBetForm(true)
            }
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

    // Extract team names from runners if available
    const team1 = eventOdds.runners?.[0]?.runner || "--"
    const team2 = eventOdds.runners?.[1]?.runner || "--"

    return (
        <div className="min-h-screen bg-black bg-opacity-90 p-0">
            {/* Logo Header */}
            <div className="bg-purple-900 py-3 px-4 flex justify-center">
                <img src="/trophy.png" alt="BOOK2500" className="h-[70px]" />
            </div>

            {/* Match Information */}
            <div className="bg-gradient-to-b from-purple-900 to-purple-950 p-4 text-center border-b border-purple-800">
                <div className="text-white text-xl font-bold mb-2">{team1} vs {team2}</div>
                <div className="text-white opacity-70 text-sm">(0/0) - (0/0)</div>

                {/* Cricket Scoreboard - only shows for cricket matches */}
                <div className="mt-4 bg-black bg-opacity-30 rounded-lg p-2 overflow-x-auto">
                    <table className="w-full text-white text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-2">Batsmen</th>
                                <th className="p-2">R</th>
                                <th className="p-2">B</th>
                                <th className="p-2">4s</th>
                                <th className="p-2">6s</th>
                                <th className="p-2">SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="text-left p-2">-</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0.0</td>
                            </tr>
                            <tr>
                                <td className="text-left p-2">-</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0</td>
                                <td className="p-2">0.0</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="flex justify-center space-x-2 mt-2">
                        <div className="text-white">This Over</div>
                        {[0, 0, 0, 0, 0].map((ball, idx) => (
                            <div key={idx} className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center text-white">
                                {ball}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row">
                {/* Match Sections */}
                <div className="flex-1 pb-20 lg:pb-0">
                    {/* Match Odds Section */}
                    <div className="border-b border-purple-900">
                        <div
                            className="flex items-center justify-between bg-purple-950 p-3 cursor-pointer"
                            onClick={() => toggleSection('matchOdds')}
                        >
                            <div className="flex items-center">
                                <div className="w-6 h-6 text-white flex items-center justify-center mr-2">
                                    ★
                                </div>
                                <h2 className="text-white font-bold">MATCH ODDS</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    CASHOUT
                                </div>
                                <div className="text-white text-xs">
                                    Min: 100.0k | Max: 250.0k
                                </div>
                                <div className="text-white">
                                    {expandedSections.matchOdds ? '▲' : '▼'}
                                </div>
                            </div>
                        </div>

                        {expandedSections.matchOdds && (
                            <div className="p-0">
                                <div className="grid grid-cols-2 w-full">
                                    <div className="text-center py-2 bg-purple-900 text-white font-bold border-b border-purple-800">
                                        BACK
                                    </div>
                                    <div className="text-center py-2 bg-purple-900 text-white font-bold border-b border-purple-800">
                                        LAY
                                    </div>
                                </div>

                                {eventOdds.runners?.map((runner, idx) => (
                                    <div key={idx} className="border-b border-purple-900">
                                        <div className="text-white font-bold pl-4 py-2 bg-purple-950">{runner.runner}</div>
                                        <div className="grid grid-cols-6 w-full">
                                            {/* BACK columns (3) */}
                                            {[2, 1, 0].map((i) => {
                                                const odds = runner.ex?.availableToBack?.[i]?.price || 0;
                                                const size = runner.ex?.availableToBack?.[i]?.size || 0;
                                                const isAvailable = odds > 0;

                                                return (
                                                    <div
                                                        key={`back-${i}`}
                                                        onClick={() => isAvailable && handleOddsClick(runner, "back", "match")}
                                                        className={`flex flex-col items-center justify-center py-3 ${isAvailable ? "cursor-pointer" : "opacity-60"} ${i === 0 ? "bg-blue-500" : i === 1 ? "bg-blue-600" : "bg-blue-700"}`}
                                                    >
                                                        <div className="text-white font-bold">
                                                            {odds.toFixed(2)}
                                                        </div>
                                                        <div className="text-xs text-gray-200">
                                                            {size.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* LAY columns (3) */}
                                            {[0, 1, 2].map((i) => {
                                                const odds = runner.ex?.availableToLay?.[i]?.price || 0;
                                                const size = runner.ex?.availableToLay?.[i]?.size || 0;
                                                const isAvailable = odds > 0;

                                                return (
                                                    <div
                                                        key={`lay-${i}`}
                                                        onClick={() => isAvailable && handleOddsClick(runner, "lay", "match")}
                                                        className={`flex flex-col items-center justify-center py-3 ${isAvailable ? "cursor-pointer" : "opacity-60"} ${i === 0 ? "bg-pink-500" : i === 1 ? "bg-pink-600" : "bg-pink-700"}`}
                                                    >
                                                        <div className="text-white font-bold">
                                                            {odds.toFixed(2)}
                                                        </div>
                                                        <div className="text-xs text-gray-200">
                                                            {size.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bookmaker Section */}
                    <div className="border-b border-purple-900">
                        <div
                            className="flex items-center justify-between bg-purple-950 p-3 cursor-pointer"
                            onClick={() => toggleSection('bookmaker')}
                        >
                            <div className="flex items-center">
                                <div className="w-6 h-6 text-white flex items-center justify-center mr-2">
                                    ★
                                </div>
                                <h2 className="text-white font-bold">BOOKMAKER</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    CASHOUT
                                </div>
                                <div className="text-white text-xs">
                                    Min: 100.0k | Max: 250.0k
                                </div>
                                <div className="text-white">
                                    {expandedSections.bookmaker ? '▲' : '▼'}
                                </div>
                            </div>
                        </div>

                        {expandedSections.bookmaker && (
                            <div className="p-0">
                                <div className="grid grid-cols-2 w-full">
                                    <div className="text-center py-2 bg-purple-900 text-white font-bold border-b border-purple-800">
                                        BACK
                                    </div>
                                    <div className="text-center py-2 bg-purple-900 text-white font-bold border-b border-purple-800">
                                        LAY
                                    </div>
                                </div>

                                {(bookmakerMarket?.runners || []).map((runner, idx) => (
                                    <div key={idx} className="border-b border-purple-900">
                                        <div className="text-white font-bold pl-4 py-2 bg-purple-950">{runner.runnerName}</div>
                                        <div className="grid grid-cols-2 w-full">
                                            {/* BACK column */}
                                            <div
                                                onClick={() => runner.batb?.[0]?.[0] > 0 && handleOddsClick(runner, "back", "bookmaker")}
                                                className={`flex flex-col items-center justify-center py-4 ${runner.batb?.[0]?.[0] > 0 ? "cursor-pointer bg-blue-600" : "opacity-60 bg-blue-800"}`}
                                            >
                                                <div className="text-white font-bold">
                                                    {runner.batb?.[0]?.[0] || "-"}
                                                </div>
                                                <div className="text-xs text-gray-200">
                                                    {(runner.batb?.[0]?.[1] || 0).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* LAY column */}
                                            <div
                                                onClick={() => runner.batl?.[0]?.[0] > 0 && handleOddsClick(runner, "lay", "bookmaker")}
                                                className={`flex flex-col items-center justify-center py-4 ${runner.batl?.[0]?.[0] > 0 ? "cursor-pointer bg-pink-600" : "opacity-60 bg-pink-800"}`}
                                            >
                                                <div className="text-white font-bold">
                                                    {runner.batl?.[0]?.[0] || "-"}
                                                </div>
                                                <div className="text-xs text-gray-200">
                                                    {(runner.batl?.[0]?.[1] || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fancy Section */}
                    <div className="border-b border-purple-900">
                        <div
                            className="flex items-center justify-between bg-purple-950 p-3 cursor-pointer"
                            onClick={() => toggleSection('fancy')}
                        >
                            <div className="flex items-center">
                                <div className="w-6 h-6 text-white flex items-center justify-center mr-2">
                                    ★
                                </div>
                                <h2 className="text-white font-bold">FANCY</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                                    CASHOUT
                                </div>
                                <div className="text-white text-xs">
                                    Min: 100.0k | Max: 250.0k
                                </div>
                                <div className="text-white">
                                    {expandedSections.fancy ? '▲' : '▼'}
                                </div>
                            </div>
                        </div>

                        {expandedSections.fancy && (
                            <div className="p-0">
                                <div className="grid grid-cols-2 w-full">
                                    <div className="text-center py-2 bg-purple-900 text-white font-bold border-b border-purple-800">
                                        NO
                                    </div>
                                    <div className="text-center py-2 bg-purple-900 text-white font-bold border-b border-purple-800">
                                        YES
                                    </div>
                                </div>

                                {fancyOdds.map((odd, idx) => (
                                    <div key={idx} className="border-b border-purple-900 last:border-b-0">
                                        <div className="flex justify-between items-center">
                                            <div className="text-white font-bold pl-4 py-2 bg-purple-950 w-full">
                                                {odd.RunnerName}
                                                {odd.slidingText && (
                                                    <span className="text-xs text-gray-300 ml-2">
                                                        {odd.slidingText}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 w-full">
                                            {/* NO column */}
                                            <div
                                                onClick={() => !odd.isSuspended && odd.BackPrice1 > 0 && handleOddsClick(odd, "no", "fancy")}
                                                className={`flex flex-col items-center justify-center py-4 ${!odd.isSuspended && odd.BackPrice1 > 0 ? "cursor-pointer bg-blue-500" : "opacity-60 bg-blue-800"}`}
                                            >
                                                <div className="text-white font-bold">
                                                    {odd.BackPrice1}
                                                </div>
                                                <div className="text-xs text-gray-200">
                                                    {odd.BackSize1.toLocaleString()}
                                                </div>
                                            </div>

                                            {/* YES column */}
                                            <div
                                                onClick={() => !odd.isSuspended && odd.LayPrice1 > 0 && handleOddsClick(odd, "yes", "fancy")}
                                                className={`flex flex-col items-center justify-center py-4 ${!odd.isSuspended && odd.LayPrice1 > 0 ? "cursor-pointer bg-pink-500" : "opacity-60 bg-pink-800"}`}
                                            >
                                                <div className="text-white font-bold">
                                                    {odd.LayPrice1}
                                                </div>
                                                <div className="text-xs text-gray-200">
                                                    {odd.LaySize1.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Betting Panel - Always visible on large screens */}
                <div className="hidden lg:block w-[400px] sticky top-0 h-screen">
                    <div className="h-full p-4 overflow-y-auto">
                        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 shadow-xl border border-gray-700">
                            {/* Betting Panel Header */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-white">
                                    <div className="font-bold text-lg">{eventOdds.eventName}</div>
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

                            {/* Betting Form Content */}
                            <div className="space-y-4">
                                <Input
                                    type="number"
                                    value={selectedOdds}
                                    onChange={(e) => setSelectedOdds(e.target.value)}
                                    className="bg-gray-800 text-white text-sm border-gray-700"
                                    placeholder="Odds"
                                />
                                <Input
                                    type="number"
                                    value={selectedStake}
                                    onChange={(e) => setSelectedStake(e.target.value)}
                                    className="bg-gray-800 text-white text-sm border-gray-700"
                                    placeholder="Stakes"
                                />
                                {/* Predefined Stakes Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {predefinedStakes[0].map((stake, index) => (
                                        <Button
                                            key={`stake-${index}`}
                                            onClick={() => handleStakeButton("predefined", stake)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1"
                                        >
                                            {stake.toLocaleString()}
                                        </Button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {predefinedStakes[1].map((stake, index) => (
                                        <Button
                                            key={`stake-${index}`}
                                            onClick={() => handleStakeButton("predefined", stake)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1"
                                        >
                                            {stake.toLocaleString()}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleStakeButton("min")}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1 text-sm"
                                    >
                                        MIN
                                    </Button>
                                    <Button
                                        onClick={() => handleStakeButton("max")}
                                        className="bg-green-600 hover:bg-green-700 text-white flex-1 text-sm"
                                    >
                                        MAX
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        className="bg-gray-700 text-white flex-1 text-sm"
                                        onClick={handleClearStake}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="bg-green-600 text-white flex-1 text-sm"
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

            {/* Mobile Betting Panel */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50" style={getMobileBetFormStyle(showMobileBetForm)}>
                <div className="bg-gradient-to-t from-purple-900 to-transparent p-2">
                    <div className="bg-[#0D1117] rounded-lg p-4 shadow-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-white text-lg">{selectedBet?.name || 'Select a bet'}</h3>
                                    <button
                                        onClick={() => {
                                            setShowMobileBetForm(false)
                                            setSelectedBet(null)
                                            handleClearStake()
                                        }}
                                        className="text-gray-400 hover:text-white p-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {selectedBet && (
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-white text-sm">
                                            {selectedBet.type} @ {selectedOdds}
                                        </p>
                                        <p className="text-white text-sm">
                                            Balance: ₹{parseInt(userBalance).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input
                                type="number"
                                value={selectedOdds}
                                readOnly
                                className="w-full bg-[#1C2128] text-white border-0 rounded-lg text-lg h-12"
                            />

                            <Input
                                type="number"
                                value={selectedStake}
                                onChange={(e) => setSelectedStake(e.target.value)}
                                placeholder="Stakes"
                                className="w-full bg-[#1C2128] text-white border-0 rounded-lg text-lg h-12"
                            />

                            <div className="grid grid-cols-4 gap-3">
                                {predefinedStakes.flat().map((stake, index) => (
                                    <button
                                        key={index}
                                        className="bg-[#8B5CF6] text-white py-3 px-2 rounded-lg text-sm font-medium hover:bg-[#7C3AED] transition-colors"
                                        onClick={() => handleStakeButton("predefined", stake)}
                                    >
                                        {stake.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="bg-[#F59E0B] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#D97706] transition-colors"
                                    onClick={() => handleStakeButton("min")}
                                >
                                    MIN
                                </button>
                                <button
                                    className="bg-[#10B981] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors"
                                    onClick={() => handleStakeButton("max")}
                                >
                                    MAX
                                </button>
                            </div>

                            {betError && (
                                <p className="text-red-500 text-sm text-center">{betError}</p>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="bg-[#374151] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#4B5563] transition-colors"
                                    onClick={handleClearStake}
                                >
                                    Clear
                                </button>
                                <button
                                    className="bg-[#10B981] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePlaceBet}
                                    disabled={!selectedStake || Number(selectedStake) < MIN_STAKE || Number(selectedStake) > MAX_STAKE}
                                >
                                    Place Bet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}