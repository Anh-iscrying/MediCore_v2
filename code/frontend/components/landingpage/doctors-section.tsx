"use client"

import { useEffect, useRef } from "react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"
import { Button } from "@/components/base/ui/button"
import { UserCheck2 } from "lucide-react"

const doctors = [
  {
    name: "Dr. Evelyn Chen",
    role: "Chief of Cardiology",
    specialty: "Advanced Cardiac Diagnostics",
    image: "/images/doctor-chen.png",
  },
  {
    name: "Dr. Marcus Vance",
    role: "Director of Neurosurgery",
    specialty: "Minimally Invasive Neuro-navigation",
    image: "/images/doctor-vance.png",
  },
  {
    name: "Dr. Sarah Jenkins",
    role: "Head of Orthopedics",
    specialty: "Sports Medicine & Joint Replacement",
    image: "/images/doctor-jenkins.png",
  },
]

export function DoctorsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = sectionRef.current?.querySelectorAll(".reveal")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="doctors" className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="reveal opacity-0 text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
            BOARD-CERTIFIED SPECIALISTS
          </p>
          <ScrollBlurText
            text="World-Class Medical Team"
            className="font-sans text-4xl text-foreground font-extrabold tracking-tight mb-6 md:text-6xl"
          />
          <p className="reveal opacity-0 animation-delay-400 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Meet our esteemed directors and chief specialists, combining years of clinical excellence with continuous technological integration.
          </p>
        </div>

        {/* Grid of Doctors (Spotify Artist Circle Style) */}
        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {doctors.map((doctor, index) => (
            <div
              key={doctor.name}
              className={`reveal opacity-0 ${index === 1 ? "animation-delay-200" : index === 2 ? "animation-delay-400" : ""} bg-card p-8 rounded-lg border border-border hover:bg-muted transition-all duration-300 flex flex-col items-center text-center group`}
              style={{
                boxShadow: 'rgba(0,0,0,0.05) 0px 8px 8px'
              }}
            >
              
              {/* Circular Avatar Container */}
              <div className="size-48 rounded-full overflow-hidden mb-6 relative border border-border group-hover:border-primary transition-colors duration-300">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <h3 className="text-foreground font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                {doctor.name}
              </h3>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">
                {doctor.role}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 h-12 overflow-hidden">
                {doctor.specialty}
              </p>

              {/* View Profile Button */}
              <Button
                variant="outline"
                className="w-full border-border hover:border-foreground text-foreground bg-transparent rounded-full py-3 font-bold uppercase tracking-widest text-[10px] transition-all duration-200"
              >
                View Profile
              </Button>

            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
