"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Plus } from "lucide-react"
import { doctors } from "@/data/doctors"
import Link from "next/link"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestedDoctors?: Array<{ id: string; name: string; specialty: string }>
}

export default function DoctorChat() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("doctorChatHistory")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(
          parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        )
      } catch (e) {
        console.error("Failed to load chat history")
        // Fallback to welcome message if parsing fails
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm your health consultation assistant. Tell me about your symptoms, health concerns, or medical history, and I'll recommend the best doctors on our platform to help you.",
            timestamp: new Date(),
          },
        ])
      }
    } else {
      // Initial greeting only if no saved history
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hi! I'm your health consultation assistant. Tell me about your symptoms, health concerns, or medical history, and I'll recommend the best doctors on our platform to help you.",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("doctorChatHistory", JSON.stringify(messages))
    }
  }, [messages])

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const parseDoctoRecommendations = (text: string) => {
    const recommended = []
    for (const doctor of doctors) {
      if (
        text.toLowerCase().includes(doctor.name.toLowerCase()) ||
        text.toLowerCase().includes(doctor.specialty.toLowerCase())
      ) {
        recommended.push({
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty,
        })
      }
    }
    return recommended
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/gemini/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "doctor_recommend",
          query: input,
          doctors: doctors.map((d) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty,
            about: d.about,
          })),
        }),
      })

      if (!res.ok) throw new Error("Failed to get recommendation")

      const json = await res.json()
      const suggestedDoctors = parseDoctoRecommendations(json.summary)

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: json.summary,
        timestamp: new Date(),
        suggestedDoctors:
          suggestedDoctors.length > 0
            ? suggestedDoctors.slice(0, 3)
            : undefined,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Could not process recommendation",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    localStorage.removeItem("doctorChatHistory")
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi! I'm your health consultation assistant. Tell me about your symptoms, health concerns, or medical history, and I'll recommend the best doctors on our platform to help you.",
        timestamp: new Date(),
      },
    ])
    toast({ title: "Chat cleared", description: "Starting fresh conversation" })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-foreground">Health Consultation</h2>
        <Button variant="ghost" size="sm" onClick={clearChat} className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 dark:bg-blue-700 text-white rounded-br-none"
                  : "bg-gray-100 dark:bg-slate-800 text-foreground rounded-bl-none"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {msg.content.split("\n").map((line, idx) => (
                  <div key={idx}>
                    {line}
                  </div>
                ))}
              </div>

              {msg.suggestedDoctors && msg.suggestedDoctors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-slate-700">
                  <p className="text-xs font-semibold mb-2 opacity-75">
                    Recommended Doctors:
                  </p>
                  <div className="space-y-2">
                    {msg.suggestedDoctors.map((doc) => {
                      const fullDoc = doctors.find((d) => d.id === doc.id)
                      return fullDoc ? (
                        <Link
                          key={doc.id}
                          href={`/doctor/${doc.id}`}
                          className="block p-2 bg-white dark:bg-slate-700 rounded hover:bg-blue-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <p className="text-xs font-semibold text-foreground">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.specialty}
                          </p>
                          <p className="text-xs mt-1 text-blue-600 dark:text-blue-400 font-medium">
                            View Profile →
                          </p>
                        </Link>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              <p className="text-xs opacity-50 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-slate-800 text-foreground px-4 py-3 rounded-lg rounded-bl-none">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !loading) handleSend()
            }}
            placeholder="Describe your symptoms or health concern..."
            className="bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="gap-1.5 h-10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
