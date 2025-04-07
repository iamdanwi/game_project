import type { FancyBet, Profile, EventData } from "./types"

// API Service
const baseUrl = "https://book2500.funzip.in/api"
// const baseUrl = "http://book2500.in:3000"
// const baseUrl = "http://test.book2500.in"

export const API_ENDPOINTS = {
  login: `${baseUrl}/login`,
  verifyLogin: `${baseUrl}/verify-login`,
  resendOtp: `${baseUrl}/resend-otp`,
  signUp: `${baseUrl}/register`,
  verifySignup: `${baseUrl}/verify-signup`,
  home: `${baseUrl}/index`,
  news: `${baseUrl}/news`,
  profile: `${baseUrl}/profile-setting`,
  logout: `${baseUrl}/logout`,
  prediction: `${baseUrl}/prediction`,
  gateway: `${baseUrl}/deposit`,
  deposit: `${baseUrl}/deposit-callback`,
  depositLog: `${baseUrl}/deposit-log`,
  transactionLog: `${baseUrl}/transaction-log`,
  betLog: `${baseUrl}/bet-log`,
  withdrawMethod: `${baseUrl}/withdraw`,
  withdrawPost: `${baseUrl}/withdraw/confirm`,
  changePassword: `${baseUrl}/password`,
  updateProfile: `${baseUrl}/profile-setting`,
  categoryMatch: `${baseUrl}/category/`,
  events: `${baseUrl}/fetch-event/`,
  eventOdds: `${baseUrl}/fetch-event-odds`,
  bookmakerOdds: `${baseUrl}/fetch-bookmaker-odds`,
  fancyOdds: `${baseUrl}/fetch-fancy-odds`,
}

// Types for API responses
export interface User {
  id: string
  name: string
  email: string
  phone: string
  balance: number
  avatar?: string
}

export interface Match {
  id: string
  team1: string
  team2: string
  score1: string
  score2: string
  date: string
  status: string
  category: string
}

export interface Player {
  id: string
  name: string
  region: string
  level: string
  lp: string
  played: number
  wins: number
  avatar?: string
}

export interface Bet {
  id: string
  thread: string
  ratio: string
  predictAmount: number
  returnAmount: number
  status: "win" | "Lost" | "Pending"
  action: "completed" | "pending"
}

// Helper function to format phone number
function formatPhoneNumber(phone: string): string {
  let formattedPhone = phone
  if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+" + formattedPhone
  }
  if (!formattedPhone.startsWith("+91")) {
    formattedPhone = "+91" + formattedPhone.substring(1)
  }
  return formattedPhone
}

// API service functions
export async function fetchHomeData() {
  try {
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(API_ENDPOINTS.home, { headers })
    if (!response.ok) throw new Error("Failed to fetch home data")
    return await response.json()
  } catch (error) {
    console.error("Error fetching home data:", error)
    throw error
  }
}

// Fetch live cricket events
export async function fetchEvents(): Promise<EventData[]> {
  try {
    // const token = localStorage.getItem("auth_token")
    // const headers: HeadersInit = {
    //   Accept: "application/json",
    //   "Content-Type": "application/json",
    // }

    // if (token) {
    //   headers["Authorization"] = `Bearer ${token}`
    // }

    const response = await fetch("https://test.book2500.in/fetch-event/")
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format')
    }

    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching events:", error)
    throw error
  }
}

// Fetch odds for a specific event
export async function fetchEventOdds(eventId: string, marketId: string) {
  try {
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_ENDPOINTS.eventOdds}/${eventId}/${marketId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch event odds: ${response.statusText}`)
    }

    const data = await response.json()
    return data.odds || null
  } catch (error) {
    console.error(`Error fetching odds for event ${eventId}:`, error)
    throw error
  }
}


export async function fetchCategoryMatches(category?: string) {
  try {
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(API_ENDPOINTS.home, { headers })
    if (!response.ok) throw new Error("Failed to fetch matches")

    const data = await response.json()

    // Extract and combine live and upcoming matches
    const matches = {
      live: data.li_ve_matche || [],
      upcoming: data.up_com_matche || [],
    }

    // If category is specified, filter matches by category
    if (category) {
      const categoryId = data.category?.find((cat: any) => cat.slug.toLowerCase() === category.toLowerCase())?.id

      if (categoryId) {
        matches.live = matches.live.filter((match: any) => match.cat_id === categoryId.toString())
        matches.upcoming = matches.upcoming.filter((match: any) => match.cat_id === categoryId.toString())
      }
    }

    return {
      live: matches.live,
      upcoming: matches.upcoming,
      categories: data.category || [],
      subCategories: data.sub_category || [],
    }
  } catch (error) {
    console.error(`Error fetching matches:`, error)
    throw error
  }
}

export async function login(phone: string) {
  try {
    const formattedPhone = formatPhoneNumber(phone)

    const response = await fetch(API_ENDPOINTS.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: formattedPhone }),
    })

    if (!response.ok) throw new Error("Login failed")
    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function verifyOtp(tempToken: string, otp: string) {
  try {
    const response = await fetch(API_ENDPOINTS.verifyLogin, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ temp_token: tempToken, otp }),
    })

    if (!response.ok) throw new Error("OTP verification failed")
    const data = await response.json()

    // Store auth token if provided
    if (data.token) {
      localStorage.setItem("auth_token", data.token)
    }

    return data
  } catch (error) {
    console.error("OTP verification error:", error)
    throw error
  }
}

export async function resendOtp(phone: string) {
  try {
    const formattedPhone = formatPhoneNumber(phone)

    const response = await fetch(API_ENDPOINTS.resendOtp, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: formattedPhone }),
    })

    if (!response.ok) throw new Error("Resend OTP failed")
    return await response.json()
  } catch (error) {
    console.error("Resend OTP error:", error)
    throw error
  }
}

export async function signUp(name: string, email: string, mobile: string) {
  try {
    const formattedPhone = formatPhoneNumber(mobile)

    const response = await fetch(API_ENDPOINTS.signUp, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone: formattedPhone,
      }),
    })

    if (!response.ok) throw new Error("Sign up failed")
    return await response.json()
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export async function verifySignupOtp(tempToken: string, otp: string) {
  try {
    const response = await fetch(API_ENDPOINTS.verifySignup, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ temp_token: tempToken, otp }),
    })

    if (!response.ok) throw new Error("Signup OTP verification failed")
    return await response.json()
  } catch (error) {
    console.error("Signup OTP verification error:", error)
    throw error
  }
}

export async function getProfile(): Promise<{ status: string; data: Profile | null }> {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) return { status: "error", data: null }

    const response = await fetch(API_ENDPOINTS.profile, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return { status: "error", data: null }
    }

    const data = await response.json()
    return { status: "success", data: data }
  } catch (error) {
    console.error("Error fetching profile:", error)
    return { status: "error", data: null }
  }
}

export async function updateProfile(profileData: Partial<Profile>): Promise<{ status: string; message: string }> {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) return { status: "error", message: "No authentication token found" }

    const response = await fetch(API_ENDPOINTS.updateProfile, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    })

    const data = await response.json()
    return { status: response.ok ? "success" : "error", message: data.message }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { status: "error", message: "Failed to update profile" }
  }
}

export async function changePassword(passwordData: any) {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(API_ENDPOINTS.changePassword, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    })

    if (!response.ok) throw new Error("Failed to change password")
    return await response.json()
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

export async function getBetHistory() {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(API_ENDPOINTS.betLog, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) throw new Error("Failed to fetch bet history")
    return await response.json()
  } catch (error) {
    console.error("Error fetching bet history:", error)
    throw error
  }
}

export async function getDepositGateway() {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(API_ENDPOINTS.gateway, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) throw new Error("Failed to fetch deposit gateway")
    return await response.json()
  } catch (error) {
    console.error("Error fetching deposit gateway:", error)
    throw error
  }
}

export async function confirmDeposit(depositData: any) {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(API_ENDPOINTS.deposit, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(depositData),
    })

    if (!response.ok) throw new Error("Failed to confirm deposit")
    return await response.json()
  } catch (error) {
    console.error("Error confirming deposit:", error)
    throw error
  }
}

export async function getWithdrawMethods() {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(API_ENDPOINTS.withdrawMethod, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) throw new Error("Failed to fetch withdraw methods")
    return await response.json()
  } catch (error) {
    console.error("Error fetching withdraw methods:", error)
    throw error
  }
}

export async function confirmWithdraw(withdrawData: any) {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) throw new Error("No authentication token found")

    const response = await fetch(API_ENDPOINTS.withdrawPost, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(withdrawData),
    })

    if (!response.ok) throw new Error("Failed to confirm withdrawal")
    return await response.json()
  } catch (error) {
    console.error("Error confirming withdrawal:", error)
    throw error
  }
}

export async function fetchLiveFancyBets(matchId: string) {
  try {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      return { fancy: [] } // Return empty data instead of throwing error
    }

    const response = await fetch(`${baseUrl}/fancy/${matchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return { fancy: [] } // Return empty data on error
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching fancy bets:", error) // Log error for debugging
    return { fancy: [] } // Return empty data on error
  }
}


// Fetch bookmaker odds for a specific event
export async function fetchBookmakerOdds(eventId: string, marketId: string) {
  try {
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_ENDPOINTS.bookmakerOdds}/${eventId}/${marketId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch bookmaker odds: ${response.statusText}`)
    }

    const data = await response.json()
    return data.odds || null
  } catch (error) {
    console.error(`Error fetching bookmaker odds for event ${eventId}:`, error)
    throw error
  }
}

// Fetch fancy odds for a specific event
export async function fetchFancyOdds(eventId: string, marketId: string) {
  try {
    const token = localStorage.getItem("auth_token")
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_ENDPOINTS.fancyOdds}/${eventId}/${marketId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch fancy odds: ${response.statusText}`)
    }

    const data = await response.json()
    return data.odds || null
  } catch (error) {
    console.error(`Error fetching fancy odds for event ${eventId}:`, error)
    throw error
  }
}

