import Link from "next/link"

const footerLinks = {
  specialties: [
    { label: "Tim mạch", href: "#specialties" },
    { label: "Nội khoa", href: "#specialties" },
    { label: "Ngoại khoa", href: "#specialties" },
    { label: "Da liễu", href: "#specialties" },
    { label: "Tai mũi họng", href: "#specialties" },
    { label: "Nhi khoa", href: "#specialties" },
  ],
  company: [
    { label: "Thông tin về chúng tôi", href: "#mission" },
    { label: "Dịch vụ của chúng tôi", href: "#products" },
    { label: "Thông tin liên hệ", href: "#" },
  ],
  patient: [
    { label: "Đặt lịch hẹn", href: "/auth/signup" },
    { label: "Cổng thông tin bệnh nhân", href: "/auth/login" },
    { label: "Tư vấn AI", href: "/auth/login" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border text-foreground py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <span className="font-sans text-xl font-bold tracking-tight text-foreground">
                Medicore<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Dịch vụ chăm sóc y tế tận tâm, chuyên nghiệp với công nghệ tiên tiến và tư vấn dựa trên trí tuệ nhân tạo, hoạt động 24/7.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>Email: info@medicorehospital.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Liên hệ: 1-800-medicore</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Địa chỉ: Medicore Hospital</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs mb-4">Chuyên khoa</h4>
            <ul className="space-y-3">
              {footerLinks.specialties.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs mb-4">Thông tin</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs mb-4">Hỗ trợ</h4>
            <ul className="space-y-3">
              {footerLinks.patient.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground/60">© 2025 Medicore Hospital. Đã đăng ký bản quyền.</p>
          <div className="flex gap-6 text-xs text-muted-foreground/60">
            <Link href="#" className="hover:text-foreground transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Điều khoản dịch vụ
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Quyền riêng tư
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
