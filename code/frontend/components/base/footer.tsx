import Link from "next/link"

const footerLinks = {
  specialties: [
    { label: "Tim mạch", href: "#specialties" },
    { label: "Nội tổng quát", href: "#specialties" },
    { label: "Ngoại khoa", href: "#specialties" },
    { label: "Da liễu", href: "#specialties" },
    { label: "Tai mũi họng", href: "#specialties" },
    { label: "Nhi khoa", href: "#specialties" },
  ],
  company: [
    { label: "Sứ mệnh Medicore", href: "#mission" },
    { label: "Công nghệ chăm sóc", href: "#tech" },
    { label: "Đội ngũ chuyên môn", href: "#doctors" },
  ],
  patient: [
    { label: "Đặt lịch khám", href: "/dashboard/appointments" },
    { label: "Cổng bệnh nhân", href: "/dashboard" },
    { label: "Hỗ trợ trước khi khám", href: "/dashboard/ai-assistant" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-foreground bg-foreground py-16 text-background lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-14 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-6 flex items-center gap-2 group">
              <span className="font-sans text-2xl font-black tracking-tight text-background transition-opacity group-hover:opacity-90">
                Medicore<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-7 text-background/70">
              Bệnh viện thông minh giúp người bệnh đặt lịch, chuẩn bị trước khi khám và theo dõi chăm sóc rõ ràng hơn.
            </p>
            <div className="space-y-3 text-sm text-background/70">
              <div>Email: lienhe@medicore.vn</div>
              <div>Tổng đài: 1900 0000</div>
              <div>Địa chỉ: cập nhật theo cơ sở khám</div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-background">Chuyên khoa</h4>
            <ul className="space-y-3">
              {footerLinks.specialties.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-background/65 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-background">Thông tin</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-background/65 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-background">Người bệnh</h4>
            <ul className="space-y-3">
              {footerLinks.patient.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-background/65 transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-background/15 pt-8 text-xs text-background/55 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Medicore Hospital. Đã đăng ký bản quyền.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              Điều khoản dịch vụ
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Quyền riêng tư
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
