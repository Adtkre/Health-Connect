"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  rating: number
  reviews: number
  experience: number
  fee: number
  avatar: string
  available: boolean
  nextAvailable: string
  education: string
  languages: string[]
  about: string
}

export interface Booking {
  id: string
  doctorId: string
  doctorName: string
  doctorAvatar?: string
  specialty: string
  date: string
  time: string
  status: "upcoming" | "completed" | "cancelled"
  type: "video" | "chat"
  fee: number
}

export interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
  isDoctor: boolean
}

// Google Calendar URL generator
export function generateGoogleCalendarUrl(booking: Booking): string {
  const startDate = new Date(`${booking.date} ${booking.time}`)
  const endDate = new Date(startDate.getTime() + 30 * 60000) // 30 min appointment
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d{3}/g, "")
  }
  
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${booking.type === "video" ? "Video" : "Chat"} Consultation with ${booking.doctorName}`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: `${booking.specialty} consultation via HealthConnect.\n\nType: ${booking.type === "video" ? "Video Call" : "Chat"}\nDoctor: ${booking.doctorName}`,
    location: booking.type === "video" ? "Video Call - HealthConnect" : "Chat - HealthConnect",
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export interface MedicalRecord {
  id: string
  date: string
  condition: string
  notes?: string
  // Optional Gemini sync fields
  geminiSummary?: string
  syncedAt?: string
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  startDate: string
  endDate?: string
  notes?: string
  // Optional Gemini sync fields
  geminiSummary?: string
  syncedAt?: string
} 

interface AppContextType {
  user: User | null
  isAuthenticated: boolean
  bookings: Booking[]
  medicalHistory: MedicalRecord[]
  prescriptions: Prescription[]
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  addBooking: (booking: Omit<Booking, "id">) => void
  removeBooking: (id: string) => void
  cancelBooking: (id: string) => void
  addMedicalRecord: (record: Omit<MedicalRecord, "id">) => void
  updateMedicalRecord: (id: string, updates: Partial<MedicalRecord>) => void
  removeMedicalRecord: (id: string) => void
  addPrescription: (p: Omit<Prescription, "id">) => void
  updatePrescription: (id: string, updates: Partial<Prescription>) => void
  removePrescription: (id: string) => void
  // Gemini sync (opt-in)
  syncMedicalRecord: (id: string) => Promise<void>
  syncPrescription: (id: string) => Promise<void>
} 

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("medicalHistory") : null
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("prescriptions") : null
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Mock authentication
    await new Promise((resolve) => setTimeout(resolve, 800))
    setUser({
      id: "user-1",
      name: email.split("@")[0],
      email,
      avatar: undefined,
    })
    return true
  }, [])

  const register = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    // Mock registration
    await new Promise((resolve) => setTimeout(resolve, 800))
    setUser({
      id: "user-1",
      name,
      email,
      avatar: undefined,
    })
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const addBooking = useCallback((booking: Omit<Booking, "id">) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
    }
    setBookings((prev) => [...prev, newBooking])
  }, [])

const removeBooking = useCallback((id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    )
  }, [])

  // Medical history handlers
  const addMedicalRecord = useCallback((record: Omit<MedicalRecord, "id">) => {
    const newRec: MedicalRecord = { ...record, id: Date.now().toString() }
    setMedicalHistory((prev) => {
      const next = [...prev, newRec]
      try { localStorage.setItem("medicalHistory", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const updateMedicalRecord = useCallback((id: string, updates: Partial<MedicalRecord>) => {
    setMedicalHistory((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      try { localStorage.setItem("medicalHistory", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const removeMedicalRecord = useCallback((id: string) => {
    setMedicalHistory((prev) => {
      const next = prev.filter((r) => r.id !== id)
      try { localStorage.setItem("medicalHistory", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // Prescriptions handlers
  const addPrescription = useCallback((p: Omit<Prescription, "id">) => {
    const newP: Prescription = { ...p, id: Date.now().toString() }
    setPrescriptions((prev) => {
      const next = [...prev, newP]
      try { localStorage.setItem("prescriptions", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const updatePrescription = useCallback((id: string, updates: Partial<Prescription>) => {
    setPrescriptions((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      try { localStorage.setItem("prescriptions", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const removePrescription = useCallback((id: string) => {
    setPrescriptions((prev) => {
      const next = prev.filter((p) => p.id !== id)
      try { localStorage.setItem("prescriptions", JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  // Gemini sync functions (opt-in)
  const syncMedicalRecord = useCallback(async (id: string) => {
    const rec = medicalHistory.find((r) => r.id === id)
    if (!rec) return
    try {
      const res = await fetch("/api/gemini/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "record", data: rec }),
      })
      if (!res.ok) throw new Error("Sync failed")
      const json = await res.json()
      updateMedicalRecord(id, { geminiSummary: json.summary, syncedAt: new Date().toISOString() })
    } catch (e) {
      console.error("syncMedicalRecord", e)
      throw e
    }
  }, [medicalHistory, updateMedicalRecord])

  const syncPrescription = useCallback(async (id: string) => {
    const p = prescriptions.find((x) => x.id === id)
    if (!p) return
    try {
      const res = await fetch("/api/gemini/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "prescription", data: p }),
      })
      if (!res.ok) throw new Error("Sync failed")
      const json = await res.json()
      updatePrescription(id, { geminiSummary: json.summary, syncedAt: new Date().toISOString() })
    } catch (e) {
      console.error("syncPrescription", e)
      throw e
    }
  }, [prescriptions, updatePrescription])

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        bookings,
        medicalHistory,
        prescriptions,
        login,
        register,
        logout,
        addBooking,
        removeBooking,
        cancelBooking,
        addMedicalRecord,
        updateMedicalRecord,
        removeMedicalRecord,
        addPrescription,
        updatePrescription,
        removePrescription,
        syncMedicalRecord,
        syncPrescription,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
