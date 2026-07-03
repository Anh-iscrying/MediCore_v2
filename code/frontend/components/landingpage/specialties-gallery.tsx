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
  badgeIcon?: React.ReactNode
}

const SpecialtiesGallery = ({
  subtitle = "Khám đúng chuyên khoa",
  title = "Chuyên khoa cho nhu cầu thường gặp",
  description = "Chọn chuyên khoa phù hợp, xem hướng chuẩn bị trước khi khám và đặt lịch với bác sĩ.",
  items,
  badgeIcon,
}: SpecialtiesGalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  useEffect(() => {
    if (!carouselApi) return

    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
      setCurrentSlide(carouselApi.selectedScrollSnap())
    }

    setScrollSnaps(carouselApi.scrollSnapList())
    updateSelection()
    carouselApi.on("select", updateSelection)
    carouselApi.on("reInit", () => {
      setScrollSnaps(carouselApi.scrollSnapList())
      updateSelection()
    })

    return () => {
      carouselApi.off("select", updateSelection)
    }
  }, [carouselApi])

  return (
    <section id="specialties" className="scroll-mt-24 border-t border-border bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-8 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-border">
              {badgeIcon}
              <span>{subtitle}</span>
            </div>
            <h2 className="mb-5 text-4xl font-black tracking-[-0.03em] text-foreground md:text-5xl">{title}</h2>
            <p className="max-w-xl text-base leading-7 text-foreground/65">{description}</p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              size="icon"
              aria-label="Xem chuyên khoa trước"
              onClick={() => carouselApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className="size-11 rounded-full border border-border bg-card text-foreground transition-all hover:border-foreground/30 hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              aria-label="Xem chuyên khoa tiếp theo"
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
              <CarouselItem key={item.id} className="basis-[86%] pl-4 sm:basis-1/2 lg:basis-1/4">
                <div className="group h-full rounded-[24px] bg-card p-7 text-left ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:bg-muted">
                  <div className="mb-7 flex size-14 items-center justify-center rounded-full bg-primary/20 text-foreground transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/30">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-black tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-7 text-foreground/65">{item.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {scrollSnaps.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`h-2 rounded-full transition-all duration-200 ${currentSlide === index ? "w-5 bg-primary" : "w-2 bg-primary/25 hover:bg-primary/45"}`}
                onClick={() => carouselApi?.scrollTo(index)}
                aria-label={`Đi tới nhóm chuyên khoa ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export { SpecialtiesGallery }
