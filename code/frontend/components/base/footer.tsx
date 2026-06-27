import Link from "next/link"

const footerLinks = {
  specialties: [
    { label: "Cardiology", href: "#specialties" },
    { label: "Neurology", href: "#specialties" },
    { label: "Orthopedics", href: "#specialties" },
    { label: "Respiratory Care", href: "#specialties" },
  ],
  company: [
    { label: "About Us", href: "#mission" },
    { label: "Our Services", href: "#products" },
    { label: "Careers", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
  patient: [
    { label: "Book Appointment", href: "/auth/signup" },
    { label: "Patient Portal", href: "/auth/login" },
    { label: "AI Consultation", href: "#" },
    { label: "FAQ", href: "#" },
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
                HealthCare<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Compassionate, expert medical care with advanced technology and AI-powered consultation available 24/7.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>Email: info@healthcarehospital.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Phone: 1-800-HEALTHCARE</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Address: Healthcare Plaza, Medical City</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs mb-4">Specialties</h4>
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
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs mb-4">About</h4>
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
            <h4 className="font-bold text-foreground uppercase tracking-widest text-xs mb-4">Patients</h4>
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
          <p className="text-xs text-muted-foreground/60">© 2025 HealthCare Hospital. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-muted-foreground/60">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Patient Rights
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
