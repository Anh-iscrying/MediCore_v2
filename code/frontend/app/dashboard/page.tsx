import Link from "next/link"
import { cn } from "@/lib/utils"

const overviewCards = [
  {
    title: "Hồ sơ bệnh nhân",
    description: "Thông tin cá nhân, liên hệ khẩn cấp, dị ứng thuốc và tiền sử bệnh lý.",
    href: "/dashboard/profile",
    meta: "Hoàn thành 80%"
  },
  {
    title: "Đặt lịch hẹn khám",
    description: "Chọn chuyên khoa, bác sĩ, ngày khám, giờ trống và khai báo triệu chứng.",
    href: "/dashboard/appointments",
    meta: "Lịch hẹn: Ngày mai 09:00",
    highlight: true
  },
  {
    title: "Hồ sơ bệnh án",
    description: "Xem lại chi tiết các đợt khám bệnh trước, chẩn đoán và hướng điều trị.",
    href: "/dashboard/history",
    meta: "Khám gần nhất: 18 Th06 2026"
  },
  {
    title: "Đơn thuốc điện tử",
    description: "Xem chi tiết các thuốc được kê theo đợt khám, tải file PDF hoặc in đơn thuốc.",
    href: "/dashboard/prescriptions",
    meta: "2 đơn thuốc đang dùng"
  },
  {
    title: "Trợ lý sức khỏe AI",
    description: "Hỏi đáp nhanh thông tin dịch vụ, chỉ dẫn phòng khám và nhắc nhở sau khám.",
    href: "/dashboard/ai-assistant",
    meta: "Trò chuyện tự động"
  }
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#868685]">Cổng bệnh nhân</p>
          <h1 className="font-sans text-3xl font-black leading-tight text-foreground text-balance md:text-5xl tracking-tight">
            Chào Alexander
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#454745] md:text-base">
            Quản lý lịch hẹn khám, hồ sơ sức khỏe, đơn thuốc điện tử và các nhắc nhở chăm sóc sức khỏe.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
          <div className="rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#868685]">Lịch hẹn sắp tới</p>
              <p className="mt-1 text-sm font-black text-foreground">Ngày mai 09:00</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#868685]">Nhắc nhở y tế</p>
              <p className="mt-1 text-sm font-black text-foreground">3 việc cần làm</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {overviewCards.map((card) => (
          <article
            key={card.href}
            className={cn(
              "rounded-xl border p-6 transition-all",
              card.highlight
                ? "bg-[#0e0f0c] border-[#0e0f0c] text-[#9fe870]"
                : "bg-card border-border text-foreground"
            )}
          >
            <div className="flex items-start justify-end gap-4">
              <span className={cn("rounded-sm border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                card.highlight
                  ? "border-[#9fe870]/20 bg-[#9fe870]/10 text-[#9fe870]"
                  : "border-border bg-background text-[#868685]"
              )}>
                Mô phỏng
              </span>
            </div>

            <h2 className={cn("mt-5 text-xl font-sans font-black tracking-tight", card.highlight ? "text-[#9fe870]" : "text-foreground")}>{card.title}</h2>
            <p className={cn("mt-2 text-sm leading-relaxed",
              card.highlight ? "text-white/95" : "text-[#454745]"
            )}>{card.description}</p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className={cn("text-xs font-semibold", card.highlight ? "text-white/80" : "text-[#868685]")}>{card.meta}</span>
              <Link
                href={card.href}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border text-center",
                  card.highlight
                    ? "bg-[#9fe870] text-[#0e0f0c] hover:bg-[#cdffad] border-[#9fe870]"
                    : "border-border text-foreground bg-background hover:bg-card hover:border-foreground"
                )}
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-foreground bg-foreground p-6 text-[#e8ebe6]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-sans font-black tracking-tight text-[#9fe870]">Cổng thông tin tự phục vụ dành cho bệnh nhân</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#868685]">
              Các chức năng được phân tách rõ ràng trên giao diện trực quan. Thao tác lưu trữ dữ liệu, xuất file đơn thuốc và kết nối AI đầy đủ sẽ được tích hợp sau.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
