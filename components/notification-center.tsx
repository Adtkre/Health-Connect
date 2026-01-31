"use client"

import React, { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export interface Notification {
  id: string
  type: "success" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (e: CustomEvent) => {
      const notification: Notification = {
        id: Date.now().toString(),
        ...e.detail,
        timestamp: new Date(),
      }
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
    }

    window.addEventListener("pushNotification", handleNotification as EventListener)
    return () => window.removeEventListener("pushNotification", handleNotification as EventListener)
  }, [])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="fixed top-24 right-4 z-40">
        <div className="relative">
          <Button variant="outline" size="icon" className="relative h-10 w-10">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-24 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg shadow-lg border-l-4 flex items-start gap-3 ${
                notif.type === "success"
                  ? "bg-green-50 dark:bg-green-950/30 border-green-500 text-green-900 dark:text-green-100"
                  : notif.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 text-yellow-900 dark:text-yellow-100"
                    : "bg-blue-50 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-100"
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold text-sm">{notif.title}</p>
                <p className="text-xs opacity-75 mt-0.5">{notif.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

// Helper function to trigger notifications
export function pushNotification(type: "success" | "warning" | "info", title: string, message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("pushNotification", {
        detail: { type, title, message },
      })
    )
  }
}
