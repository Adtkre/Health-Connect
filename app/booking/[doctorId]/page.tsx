"use client"

import { use, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { doctors } from "@/data/doctors"
import { useApp, generateGoogleCalendarUrl } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Check,
  Loader2,
  Video,
  MessageCircle,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
]

const getNextDays = () => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    days.push({
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    })
  }
  return days
}

type Step = "schedule" | "payment" | "confirmation"

export default function BookingPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, addBooking } = useApp()

  const [step, setStep] = useState<Step>("schedule")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(false)

  // Payment form state
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [errors, setErrors] = useState<{ card?: string; expiry?: string; cvc?: string }>({})

  // Helpers
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 19)
    return digits.replace(/(.{4})/g, "$1 ").trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length < 3) return digits
    return digits.slice(0, 2) + "/" + digits.slice(2)
  }

  const validateExpiry = (value: string) => {
    const [m, y] = value.split("/")
    if (!m || !y || m.length !== 2 || y.length !== 2) return false
    const month = parseInt(m, 10)
    if (isNaN(month) || month < 1 || month > 12) return false
    return true
  }

  const validateCVC = (value: string) => {
    return /^[0-9]{3,4}$/.test(value)
  }

  const consultType = (searchParams.get("type") as "video" | "chat") || "video"
  const days = getNextDays()
  const doctor = doctors.find((d) => d.id === doctorId)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Doctor not found</h1>
          <Button asChild>
            <Link href="/">Back to doctors</Link>
          </Button>
        </main>
      </div>
    )
  }

  const handlePayment = async () => {
    setErrors({})
    let hasError = false
    const digits = cardNumber.replace(/\D/g, "")

    if (digits.length < 16 || digits.length > 19) {
      setErrors((e) => ({ ...e, card: "Enter a valid card number (16–19 digits)" }))
      hasError = true
    }

    if (!validateExpiry(expiry)) {
      setErrors((e) => ({ ...e, expiry: "Invalid expiry date" }))
      hasError = true
    }

    if (!validateCVC(cvc)) {
      setErrors((e) => ({ ...e, cvc: "Invalid CVC" }))
      hasError = true
    }

    if (hasError) return

    setLoading(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    addBooking({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorAvatar: doctor.avatar,
      specialty: doctor.specialty,
      date: selectedDate,
      time: selectedTime,
      status: "upcoming",
      type: consultType,
      fee: doctor.fee,
    })

    setLoading(false)
    setStep("confirmation")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href={`/doctor/${doctor.id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to profile</span>
          </Link>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2">
            {(["schedule", "payment", "confirmation"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === s || (["schedule", "payment", "confirmation"].indexOf(step) > i)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {["schedule", "payment", "confirmation"].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      "w-12 sm:w-20 h-0.5 transition-colors",
                      ["schedule", "payment", "confirmation"].indexOf(step) > i
                        ? "bg-primary"
                        : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <span className="text-xs text-muted-foreground">Schedule</span>
            <span className="text-xs text-muted-foreground">Payment</span>
            <span className="text-xs text-muted-foreground">Confirmed</span>
          </div>
        </motion.div>

        {/* Doctor Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image
                src={doctor.avatar || "/placeholder.svg"}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground">{doctor.name}</h2>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
              {consultType === "video" ? (
                <Video className="w-4 h-4 text-primary" />
              ) : (
                <MessageCircle className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm font-medium capitalize">{consultType}</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Schedule Step */}
          {step === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Date Selection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Select Date</h3>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => setSelectedDate(d.date)}
                      className={cn(
                        "flex flex-col items-center p-2 sm:p-3 rounded-lg border transition-colors",
                        selectedDate === d.date
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-xs text-muted-foreground">{d.day}</span>
                      <span
                        className={cn(
                          "text-lg font-semibold",
                          selectedDate === d.date ? "text-primary" : "text-foreground"
                        )}
                      >
                        {d.dayNum}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Select Time</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                        selectedTime === time
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-foreground hover:border-primary/50"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep("payment")}
                disabled={!selectedDate || !selectedTime}
                className="w-full h-12 text-base"
              >
                Continue to Payment
              </Button>
            </motion.div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Appointment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground capitalize">{consultType} Consultation</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-semibold text-foreground">${doctor.fee}</span>
                  </div>
                </div>
              </div>

              {/* Mock Payment Form */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Payment Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      className="mt-1.5"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      inputMode="numeric"
                      maxLength={23}
                      aria-invalid={!!errors.card}
                    />
                    {errors.card && <p className="text-xs text-destructive mt-1">{errors.card}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="mt-1.5"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        inputMode="numeric"
                        maxLength={5}
                        aria-invalid={!!errors.expiry}
                      />
                      {errors.expiry && <p className="text-xs text-destructive mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        className="mt-1.5"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        inputMode="numeric"
                        maxLength={4}
                        aria-invalid={!!errors.cvc}
                      />
                      {errors.cvc && <p className="text-xs text-destructive mt-1">{errors.cvc}</p>}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This is a demo. No real payment will be processed.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("schedule")}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={loading || !cardNumber || !expiry || !cvc}
                  className="flex-1 h-12 text-base"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    `Pay $${doctor.fee}`
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Confirmation Step */}
          {step === "confirmation" && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-accent" />
              </motion.div>

              <h2 className="text-2xl font-semibold text-foreground mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground mb-8">
                Your appointment with {doctor.name} has been scheduled.
              </p>

              <div className="bg-card border border-border rounded-xl p-6 text-left mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium text-foreground capitalize">{consultType} Consultation</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                asChild
                className="w-full mb-4 bg-transparent"
              >
                <a 
                  href={generateGoogleCalendarUrl({
                    id: Date.now().toString(),
                    doctorId: doctor.id,
                    doctorName: doctor.name,
                    doctorAvatar: doctor.avatar,
                    specialty: doctor.specialty,
                    date: selectedDate,
                    time: selectedTime,
                    status: "upcoming",
                    type: consultType,
                    fee: doctor.fee,
                  })} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Add to Google Calendar
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href="/">Find More Doctors</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/appointments">View Appointments</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
