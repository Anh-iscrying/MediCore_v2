"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/base/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"

const products = [
  {
    name: "Vitality Suite",
    description: "Personalized longevity and preventive medicine program designed to optimize your health span, energy, and cellular vitality.",
    image: "/images/product-vitality.png",
    tag: "Wellness & Longevity",
  },
  {
    name: "Serenity Mental Care",
    description: "Immersive mental health support, mindfulness integration, and professional psychiatric counseling to restore inner peace.",
    image: "/images/product-serenity.png",
    tag: "Mental Well-being",
  },
  {
    name: "Equilibrium Rehab",
    description: "Advanced movement science, posture correction, and state-of-the-art physical rehab program to restore your body's balance.",
    image: "/images/product-equilibrium.png",
    tag: "Physical Rehabilitation",
  },
]

export function ProductSection() {
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
    <section ref={sectionRef} id="products" className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="reveal opacity-0 text-sm uppercase tracking-[0.2em] text-primary font-bold mb-4">
            PROGRAMS & SERVICES
          </p>
          <ScrollBlurText
            text="Health Optimization Suites"
            className="font-sans text-4xl text-foreground text-balance mb-6 md:text-6xl font-bold tracking-tight"
          />
          <p className="reveal opacity-0 animation-delay-400 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore our specialized health optimization suites and digital therapeutic services designed for your modern lifestyle.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible -mx-6 px-6 lg:mx-0">
          {products.map((product, index) => (
            <div
              key={product.name}
              className={`reveal opacity-0 ${index === 1 ? "animation-delay-200" : index === 2 ? "animation-delay-400" : ""} group min-w-[85vw] md:min-w-[70vw] lg:min-w-0 snap-center`}
            >
              <div className="bg-card rounded-lg overflow-hidden border border-border hover:bg-muted transition-all duration-300" style={{
                boxShadow: 'rgba(0,0,0,0.05) 0px 8px 8px'
              }}>
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted z-10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full z-10 border border-border">
                    {product.tag}
                  </span>
                </div>
                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h3 className="font-sans text-foreground mb-3 text-2xl font-bold tracking-tight">{product.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 h-20 overflow-hidden line-clamp-3">{product.description}</p>
                  <Button
                    variant="default"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-102 font-bold tracking-widest uppercase text-[11px] rounded-full py-4 transition-all duration-200"
                  >
                    Discover Program
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
