"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DoctorCard } from "@/components/doctor-card"
import { doctors, specialties } from "@/data/doctors"
import { Input } from "@/components/ui/input"
import { Search, Shield, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const stats = [
  { icon: Users, value: "500+", label: "Verified Doctors" },
  { icon: Clock, value: "24/7", label: "Available Support" },
  { icon: Shield, value: "100%", label: "Secure & Private" },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSpecialty =
        selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty
      return matchesSearch && matchesSpecialty
    })
  }, [searchQuery, selectedSpecialty])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4"
              >
                Trusted by 10,000+ patients
              </motion.span>
              <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4 text-balance tracking-tight">
                Find the right doctor<br className="hidden sm:block" /> for you
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                Book appointments with verified healthcare professionals. Chat or video consult from the comfort of your home.
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex gap-6 lg:gap-8">
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search doctors or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Specialty Filters */}
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => setSelectedSpecialty(specialty)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  selectedSpecialty === specialty
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {specialty}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground mb-6"
        >
          {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available
        </motion.p>

        {/* Doctor Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground text-lg">No doctors found matching your criteria</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSelectedSpecialty("All Specialties")
              }}
              className="mt-4 text-primary hover:underline font-medium"
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
