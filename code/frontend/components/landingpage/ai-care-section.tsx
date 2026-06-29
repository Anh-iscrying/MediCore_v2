"use client"

import { useEffect, useRef } from "react"
import { ScrollBlurText } from "@/components/base/scroll-blur-text"
import { Send, CheckCircle2 } from "lucide-react"

export function AICareSection() {
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
    <section ref={sectionRef} id="ai-care" className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Chat Mockup on the Left */}
          <div className="reveal opacity-0 order-2 lg:order-1 flex justify-center">
            <div className="w-full max-w-[380px] bg-card rounded-xl border border-border overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/20 flex flex-col h-[480px]">
              
              {/* Chat Header */}
              <div className="bg-muted px-5 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border shrink-0 text-xs font-bold text-primary">
                    AI
                  </div>
                  <div>
                    <div className="text-foreground text-xs font-bold uppercase tracking-wider">Medicore AI</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-[10px] text-muted-foreground">Hoạt động 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col justify-end text-xs">
                
                {/* User Message */}
                <div className="bg-primary text-primary-foreground p-3.5 rounded-lg rounded-tr-none self-end max-w-[80%] leading-relaxed">
                  Xin chào, tôi cảm thấy chóng mặt và buồn nôn. Tôi nên làm gì?
                </div>

                {/* AI Triage Message */}
                <div className="bg-muted border border-border text-foreground p-3.5 rounded-lg rounded-tl-none self-start max-w-[80%] leading-relaxed flex gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border shrink-0 text-[8px] font-bold text-primary">
                    AI
                  </div>
                  <div>
                    Bạn có thể đang gặp phải tình trạng chóng mặt do nhiều nguyên nhân khác nhau. Tôi khuyên bạn nên nghỉ ngơi, uống nước và theo dõi các triệu chứng. Nếu tình trạng không cải thiện hoặc trở nên nghiêm trọng, hãy đặt lịch hẹn với bác sĩ chuyên khoa để được tư vấn chi tiết.
                  </div>
                </div>

                {/* Typing indicators */}
                <div className="flex items-center gap-1.5 pt-2 pl-2">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-muted flex gap-2.5">
                <div className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Nhập tin nhắn...</span>
                </div>
                <button className="size-8 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-primary-foreground transition-colors cursor-pointer">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Descriptive Content on the Right */}
          <div className="reveal opacity-0 order-1 lg:order-2 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-bold mb-4">
              Chăm sóc khách hàng
            </p>
            <ScrollBlurText
              text="Hỗ trợ y tế thông minh"
              className="font-sans text-4xl text-foreground font-extrabold tracking-tight mb-6 md:text-5xl"
            />
            <p className="text-muted-foreground text-base leading-relaxed mb-10">
              Trợ lý y tế thông minh AI của chúng tôi luôn sẵn sàng 24/7 để giải đáp các thắc mắc y tế, đánh giá triệu chứng và đặt lịch hẹn khám bác sĩ ngay lập tức.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div>
                  <h4 className="text-foreground font-bold text-base mb-1">Sàng lọc triệu chứng</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Đánh giá triệu chứng ngay lập tức và nhận hướng dẫn an toàn phù hợp với tình trạng của bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div>
                  <h4 className="text-foreground font-bold text-base mb-1">Hướng dẫn đăng ký khám</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Nhận hướng dẫn chi tiết về cách đặt lịch hẹn với bác sĩ chuyên khoa phù hợp với nhu cầu của bạn.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div>
                  <h4 className="text-foreground font-bold text-base mb-1">Theo dõi sức khỏe</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Nhận lịch kê đơn sau tư vấn, cảnh báo kiểm tra và nhắc nhở nhật ký tiến độ, giúp bạn duy trì sức khỏe tốt nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
