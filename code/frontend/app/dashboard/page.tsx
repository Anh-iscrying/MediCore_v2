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

const cardShadow = { boxShadow: "0px 2px 4px rgba(0,0,0,0.2), 0px 8px 16px -4px rgba(0,0,0,0.4)" }

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-4 md:p-8">
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#6c6a64]">Cổng bệnh nhân</p>
          <h1 className="font-serif text-3xl font-normal leading-tight text-foreground text-balance md:text-5xl tracking-tight">
            Chào Alexander
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3d3d3a] md:text-base">
            Quản lý lịch hẹn khám, hồ sơ sức khỏe, đơn thuốc điện tử và các nhắc nhở chăm sóc sức khỏe.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
          <div className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-4 shadow-sm" style={cardShadow}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c6a64]">Lịch hẹn sắp tới</p>
              <p className="mt-1 text-sm font-bold text-foreground">Ngày mai 09:00</p>
            </div>
          </div>

          <div className="rounded-lg border border-[#e6dfd8] bg-[#efe9de] p-4 shadow-sm" style={cardShadow}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6c6a64]">Nhắc nhở y tế</p>
              <p className="mt-1 text-sm font-bold text-foreground">3 việc cần làm</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {overviewCards.map((card) => (
          <article
            key={card.href}
            className={cn(
              "rounded-lg border p-6 shadow-sm transition-all",
              card.highlight
                ? "bg-[#cc785c] border-[#cc785c] text-white"
                : "bg-[#efe9de] border-[#e6dfd8] text-foreground"
            )}
            style={cardShadow}
          >
            <div className="flex items-start justify-end gap-4">
              <span className={cn("rounded-md border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                card.highlight
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-[#e6dfd8] bg-[#faf9f5] text-[#6c6a64]"
              )}>
                Mô phỏng
              </span>
            </div>

            <h2 className="mt-5 text-xl font-serif font-medium tracking-tight">{card.title}</h2>
            <p className={cn("mt-2 text-sm leading-relaxed",
              card.highlight ? "text-white/95" : "text-[#3d3d3a]"
            )}>{card.description}</p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className={cn("text-xs font-semibold", card.highlight ? "text-white/80" : "text-[#6c6a64]")}>{card.meta}</span>
              <Link
                href={card.href}
                className={cn(
                  "rounded-md px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border text-center",
                  card.highlight
                    ? "bg-[#faf9f5] text-[#cc785c] hover:bg-[#efe9de] border-[#faf9f5]"
                    : "border-[#e6dfd8] text-[#141413] bg-[#faf9f5] hover:bg-[#efe9de] hover:border-white"
                )}
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-[#1f1e1b] bg-[#181715] p-6 shadow-md text-[#faf9f5]" style={cardShadow}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-serif font-medium tracking-tight text-[#faf9f5]">Cổng thông tin tự phục vụ dành cho bệnh nhân</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#a09d96]">
              Các chức năng được phân tách rõ ràng trên giao diện trực quan. Thao tác lưu trữ dữ liệu, xuất file đơn thuốc và kết nối AI đầy đủ sẽ được tích hợp sau.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
