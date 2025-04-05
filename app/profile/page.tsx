"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProfile, updateProfile, getBetHistory } from "@/lib/api"
import type { Profile } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [betHistory, setBetHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { status, data } = await getProfile()
        if (status === "success") {
          setProfile(data)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    const loadBetHistory = async () => {
      try {
        const data = await getBetHistory()
        setBetHistory(data.bets || [])
      } catch (error) {
        console.error("Error loading bet history:", error)
      }
    }

    loadProfile()
    loadBetHistory()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const { status, message } = await updateProfile({
        name: profile?.name,
        email: profile?.email,
        mobile: profile?.mobile,
        address: profile?.address,
        city: profile?.city,
        country: profile?.country,
        zip_code: profile?.zip_code,
      })

      if (status === "success") {
        setSuccess(message || "Profile updated successfully!")
      } else {
        setError(message || "Failed to update profile")
      }
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-white">Please login to view profile</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-brand-darkPurple rounded-lg overflow-hidden shadow-xl">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* User Avatar and Basic Info */}
            <div className="md:w-1/4">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-brand-gold">
                  <Image
                    src={profile.image_url || "/avatars/profile.png"}
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h1 className="mt-4 text-2xl font-bold text-white">{profile.name}</h1>
                <p className="text-gray-400">{profile.email}</p>

                <div className="mt-4 bg-brand-purple p-4 rounded-lg w-full">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Account Balance:</span>
                    <span className="text-brand-gold font-bold">₹{parseFloat(profile.balance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since:</span>
                    <span className="text-white">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <Button className="w-full bg-brand-red hover:bg-red-700 text-white font-bold">Deposit Funds</Button>
                </div>

                <div className="mt-2 w-full">
                  <Button className="w-full bg-brand-green hover:bg-green-700 text-white font-bold">
                    Withdraw Funds
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs for Profile Management */}
            <div className="md:w-3/4">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="profile" className="text-white">
                    Profile Settings
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-white">
                    Bet History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "Full Name", key: "name" },
                        { label: "Email Address", key: "email" },
                        { label: "Phone Number", key: "mobile" },
                        { label: "Address", key: "address" },
                        { label: "City", key: "city" },
                        { label: "Country", key: "country" },
                        { label: "ZIP Code", key: "zip_code" },
                      ].map((field) => (
                        <div key={field.key} className="space-y-2">
                          <label htmlFor={field.key} className="block text-sm font-medium text-gray-200">
                            {field.label}
                          </label>
                          <Input
                            id={field.key}
                            type="text"
                            value={profile[field.key] || ""}
                            onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-brand-purple text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
                          />
                        </div>
                      ))}
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    {success && <div className="text-green-500 text-sm">{success}</div>}

                    <Button
                      type="submit"
                      className="bg-brand-green hover:bg-green-700 text-white font-bold py-2 px-6"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="history">
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead className="bg-brand-purple">
                        <tr>
                          <th className="p-3 text-left">ID</th>
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-left">Game</th>
                          <th className="p-3 text-left">Amount</th>
                          <th className="p-3 text-left">Result</th>
                          <th className="p-3 text-left">Return</th>
                        </tr>
                      </thead>
                      <tbody>
                        {betHistory.map((bet: any) => (
                          <tr key={bet.id} className="border-t border-gray-700">
                            <td className="p-3">{bet.id}</td>
                            <td className="p-3">{new Date(bet.created_at).toLocaleDateString()}</td>
                            <td className="p-3">{bet.game}</td>
                            <td className="p-3">₹{parseFloat(bet.amount).toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`status-${bet.status.toLowerCase()}`}>
                                {bet.status}
                              </span>
                            </td>
                            <td className="p-3">₹{parseFloat(bet.return_amount || '0').toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

