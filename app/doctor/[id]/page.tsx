"use client"

import { use, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { doctors } from "@/data/doctors"
import { Button } from "@/components/ui/button"
import { useApp } from "@/context/app-context"
import {
  Star,
  Clock,
  GraduationCap,
  Languages,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useApp()
  const [consultType, setConsultType] = useState<"video" | "chat">("video")
  
  const doctor = doctors.find((d) => d.id === id)

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Doctor not found</h1>
          <p className="text-muted-foreground mb-4">ID: {id}</p>
          <Button asChild>
            <Link href="/">Back to doctors</Link>
          </Button>
        </main>
      </div>
    )
  }

  const handleBooking = () => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    router.push(`/booking/${doctor.id}?type=${consultType}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to doctors</span>
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-6 sm:p-8 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-muted mx-auto sm:mx-0">
              <Image
                src={doctor.avatar || "/placeholder.svg"}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
                {doctor.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-3">{doctor.specialty}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{doctor.rating}</span>
                  <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{doctor.experience} years exp.</span>
                </div>
              </div>

              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                  doctor.available
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{doctor.nextAvailable}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed">{doctor.about}</p>
            </motion.div>

            {/* Education & Languages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-foreground">Education</h3>
                  </div>
                  <p className="text-muted-foreground">{doctor.education}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="w-4 h-4 text-primary" />
                    <h3 className="font-medium text-foreground">Languages</h3>
                  </div>
                  <p className="text-muted-foreground">{doctor.languages.join(", ")}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="mb-6">
                <span className="text-2xl font-semibold text-foreground">${doctor.fee}</span>
                <span className="text-muted-foreground"> / consultation</span>
              </div>

              {/* Consult Type Selection */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-foreground">Consultation type</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConsultType("video")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                      consultType === "video"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Video
                      className={cn(
                        "w-5 h-5",
                        consultType === "video" ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        consultType === "video" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Video
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsultType("chat")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors",
                      consultType === "chat"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <MessageCircle
                      className={cn(
                        "w-5 h-5",
                        consultType === "chat" ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        consultType === "chat" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      Chat
                    </span>
                  </button>
                </div>
              </div>

              <Button onClick={handleBooking} className="w-full h-12 text-base" disabled={!doctor.available}>
                {doctor.available ? "Book Appointment" : "Not Available"}
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  You&apos;ll need to sign in to book
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
