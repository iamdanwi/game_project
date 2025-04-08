"use client"

import type React from "react"
import { useState } from "react"

type BetModalProps = {
    isOpen: boolean
    onClose: () => void
    runnerName: string
    odds: number
    size: number
    isBack: boolean
    position?: { top: number; left: number }
}

const BetModal: React.FC<BetModalProps> = ({ isOpen, onClose, runnerName, odds, size, isBack, position }) => {
    const [stake, setStake] = useState("")

    if (!isOpen) {
        return null
    }

    const modalStyle = {
        position: "absolute",
        top: position?.top || "50%",
        left: position?.left || "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        borderRadius: "8px",
        width: "300px",
    }

    return (
        <div style={modalStyle as React.CSSProperties}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Place Bet</h2>
            <p className="text-gray-700 mb-2">Runner: {runnerName}</p>
            <p className="text-gray-700 mb-2">Odds: {odds}</p>
            <p className="text-gray-700 mb-2">Size: {size}</p>
            <p className="text-gray-700 mb-2">Type: {isBack ? "Back" : "Lay"}</p>

            <div className="mb-4">
                <label htmlFor="stake" className="block text-gray-700 text-sm font-bold mb-2">
                    Stake:
                </label>
                <input
                    type="number"
                    id="stake"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={stake}
                    onChange={(e) => setStake(e.target.value)}
                />
            </div>

            <div className="flex justify-end">
                <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Place Bet</button>
            </div>
        </div>
    )
}

export default BetModal
