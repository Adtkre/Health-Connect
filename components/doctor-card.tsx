"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Doctor } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Star, Clock, Video, MessageCircle, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoctorCardProps {
  doctor: Doctor
  index?: number
}

export function DoctorCard({ doctor, index = 0 }: DoctorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/doctor/${doctor.id}`}>
        <div className="bg-card border border-border rounded-2xl p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 cursor-pointer">
          <div className="flex gap-4 mb-5">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted ring-2 ring-background shadow-sm">
              <Image
                src={doctor.avatar || "/placeholder.svg"}
                alt={doctor.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{doctor.name}</h3>
              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">{doctor.rating}</span>
                </div>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{doctor.reviews} reviews</span>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{doctor.experience} yrs exp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </div>
          </div>

          {/* Availability Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium w-fit mb-5",
              doctor.available
                ? "bg-accent/10 text-accent"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Clock className="w-3 h-3" />
            <span>{doctor.nextAvailable}</span>
          </div>

          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
            <div>
              <span className="text-xl font-semibold text-foreground">${doctor.fee}</span>
              <span className="text-sm text-muted-foreground"> / consult</span>
            </div>
            <Button size="sm" className="transition-opacity">
              Book Now
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
