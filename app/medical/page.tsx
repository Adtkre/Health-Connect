"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import MedicalHistory from "@/components/medical-history"
import Prescriptions from "@/components/prescriptions"
import { useApp } from "@/context/app-context"

export default function MedicalPage() {
  const { isAuthenticated } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">My Health Records</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <MedicalHistory />
          </div>
          <div>
            <Prescriptions />
          </div>
        </div>
      </main>
    </div>
  )
}
