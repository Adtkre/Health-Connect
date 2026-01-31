"use client"

import React from "react"

import { use, useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { doctors } from "@/data/doctors"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, MoreVertical, Phone, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  isDoctor: boolean
  timestamp: Date
}

const mockResponses = [
  "I understand your concern. Could you tell me more about when these symptoms started?",
  "Based on what you've described, I'd recommend scheduling an in-person visit for a thorough examination.",
  "That's a common symptom. Have you noticed any other changes recently?",
  "I'll prescribe something that should help. Please follow the dosage instructions carefully.",
  "Let's monitor this for a few days. If symptoms persist, please let me know.",
]

export default function ChatPage({
  params,
}: {
  params: Promise<{ doctorId: string }>
}) {
  const { doctorId } = use(params)
  const router = useRouter()
  const { isAuthenticated, user } = useApp()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you today?",
      isDoctor: true,
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const doctor = doctors.find((d) => d.id === doctorId)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Doctor not found</h1>
          <Button asChild>
            <Link href="/">Back to doctors</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isDoctor: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate doctor response
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    const doctorResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      isDoctor: true,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, doctorResponse])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/appointments"
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
              <Image
                src={doctor.avatar || "/placeholder.svg"}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">{doctor.name}</h1>
              <p className="text-xs text-accent">Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Start voice call"
            >
              <Phone className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Start video call"
            >
              <Video className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn("flex", message.isDoctor ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl",
                    message.isDoctor
                      ? "bg-card border border-border rounded-bl-md"
                      : "bg-primary text-primary-foreground rounded-br-md"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.isDoctor ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 h-12"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="h-12 w-12 shrink-0"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
