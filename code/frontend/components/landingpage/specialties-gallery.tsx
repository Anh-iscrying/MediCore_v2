"use client"

import type React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/base/ui/button"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/base/ui/carousel"

export interface SpecialtyItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export interface SpecialtiesGalleryProps {
  subtitle?: string
  title?: string
  description?: string
  items: SpecialtyItem[]
}

const SpecialtiesGallery = ({
  subtitle = "CHUYÊN MÔN Y TẾ",
  title = "Các chuyên khoa hàng đầu",
  description = "Dịch vụ chăm sóc sức khỏe toàn diện được cung cấp bởi các chuyên gia giàu kinh nghiệm, ứng dụng công nghệ y tế tiên tiến.",
  items,
}: SpecialtiesGalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!carouselApi) return

    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
      setCurrentSlide(carouselApi.selectedScrollSnap())
    }

    updateSelection()
    carouselApi.on("select", updateSelection)

    return () => {
      carouselApi.off("select", updateSelection)
    }
  }, [carouselApi])

  return (
    <section id="specialties" className="border-t border-border bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-8 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-left">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-primary">{subtitle}</p>
            <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">{title}</h2>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
          </div>

          <div className="flex gap-3">
            <Button
              size="icon"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="size-11 rounded-full border border-border bg-card text-foreground transition-all hover:border-foreground/30 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => carouselApi?.scrollNext()}
              disabled={!canScrollNext}
              className="size-11 rounded-full border border-border bg-card text-foreground transition-all hover:border-foreground/30 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        <Carousel setApi={setCarouselApi} opts={{ align: "start" }}>
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/4">
                <div className="group h-full rounded-2xl border border-border bg-card p-7 text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:bg-muted hover:shadow-lg">
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:ring-primary/25">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-8 flex justify-center gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2 rounded-full transition-all duration-200 ${
                currentSlide === index ? "w-5 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Đi tới slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export { SpecialtiesGallery }
