"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/base/ui/button"
import { ArrowRight } from "lucide-react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"

const products = [
  {
    name: "Gói Sức Sống",
    description: "Chương trình y học dự phòng và kéo dài tuổi khỏe được cá nhân hóa nhằm tối ưu sức khỏe, năng lượng và sức sống tế bào.",
    image: "/images/product-vitality.png",
    tag: "Sức khỏe & tuổi thọ",
  },
  {
    name: "Chăm Sóc Tinh Thần Serenity",
    description: "Hỗ trợ sức khỏe tinh thần chuyên sâu, tích hợp chánh niệm và tư vấn tâm thần chuyên nghiệp để khôi phục sự bình an nội tại.",
    image: "/images/product-serenity.png",
    tag: "Sức khỏe tinh thần",
  },
  {
    name: "Phục Hồi Cân Bằng",
    description: "Chương trình phục hồi chức năng hiện đại, chỉnh tư thế và ứng dụng khoa học vận động tiên tiến để khôi phục sự cân bằng cơ thể.",
    image: "/images/product-equilibrium.png",
    tag: "Phục hồi thể chất",
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
            CHƯƠNG TRÌNH & DỊCH VỤ
          </p>
          <ScrollBlurText
            text="Gói tối ưu sức khỏe"
            className="font-sans text-4xl text-foreground text-balance mb-6 md:text-6xl font-bold tracking-tight"
          />
          <p className="reveal opacity-0 animation-delay-400 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
Khám phá các gói tối ưu sức khỏe chuyên biệt và dịch vụ trị liệu số được thiết kế phù hợp với lối sống hiện đại của bạn.
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
                    Khám phá chương trình
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
