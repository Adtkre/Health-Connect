"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useApp, generateGoogleCalendarUrl } from "@/context/app-context"
import { doctors } from "@/data/doctors"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Video,
  MessageCircle,
  X,
  Check,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function AppointmentsPage() {
  const router = useRouter()
  const { isAuthenticated, bookings, cancelBooking, removeBooking } = useApp()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const upcomingBookings = bookings.filter((b) => b.status === "upcoming")
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  const getDoctor = (doctorId: string) => doctors.find((d) => d.id === doctorId)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-accent" />
      case "cancelled":
        return <X className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-primary" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Upcoming"
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-semibold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Manage your upcoming and past consultations</p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No appointments yet</h2>
            <p className="text-muted-foreground mb-6">
              Find a doctor and book your first consultation
            </p>
            <Button asChild>
              <Link href="/">Find Doctors</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Appointments */}
            {upcomingBookings.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Upcoming
                </h2>
                <div className="space-y-4">
                  <AnimatePresence>
                    {upcomingBookings.map((booking, index) => {
                      const doctor = getDoctor(booking.doctorId)
                      return (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-card border border-border rounded-xl p-5"
                        >
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              {doctor && (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                  <Image
                                    src={doctor.avatar || "/placeholder.svg"}
                                    alt={doctor.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground">{booking.doctorName}</h3>
                                <p className="text-sm text-muted-foreground">{booking.specialty}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {new Date(booking.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{booking.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    {booking.type === "video" ? (
                                      <Video className="w-4 h-4" />
                                    ) : (
                                      <MessageCircle className="w-4 h-4" />
                                    )}
                                    <span className="capitalize">{booking.type}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col gap-2 sm:items-end">
                              {booking.type === "chat" ? (
                                <Button asChild size="sm" className="flex-1 sm:flex-none">
                                  <Link href={`/chat/${booking.doctorId}`}>Start Chat</Link>
                                </Button>
                              ) : (
                                <Button size="sm" className="flex-1 sm:flex-none">
                                  Join Call
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1 sm:flex-none bg-transparent"
                              >
                                <a 
                                  href={generateGoogleCalendarUrl(booking)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  <Calendar className="w-4 h-4 mr-1.5" />
                                  Add to Calendar
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              </Button>
                              <div className="flex gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelBooking(booking.id)}
                                  className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBooking(booking.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            {/* Past Appointments */}
            {pastBookings.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Past
                </h2>
                <div className="space-y-4">
                  {pastBookings.map((booking, index) => {
                    const doctor = getDoctor(booking.doctorId)
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card border border-border rounded-xl p-5 opacity-75"
                      >
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            {doctor && (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                <Image
                                  src={doctor.avatar || "/placeholder.svg"}
                                  alt={doctor.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{booking.doctorName}</h3>
                              <p className="text-sm text-muted-foreground">{booking.specialty}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(booking.date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{booking.time}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium self-start",
                              booking.status === "completed"
                                ? "bg-accent/10 text-accent"
                                : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {getStatusIcon(booking.status)}
                            <span>{getStatusLabel(booking.status)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            )}
          </div>
        )}

        {/* Info Banner */}
        {upcomingBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-secondary rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground font-medium">Appointment Reminders</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ll receive email and notification reminders 24 hours and 1 hour before your appointments.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
