import { Header } from "@/components/base/header"
import { HeroSection } from "@/components/landingpage/hero-section"
import { ScienceSection } from "@/components/landingpage/science-section"
import { AICareSection } from "@/components/landingpage/ai-care-section"
import { TechSection } from "@/components/landingpage/tech-section"
import { DoctorsSection } from "@/components/landingpage/doctors-section"
import { PatientStoriesSection } from "@/components/landingpage/testimonials-section"
import { MissionSection } from "@/components/landingpage/mission-section"
import { Footer } from "@/components/base/footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <ScienceSection />
      <AICareSection />
      <TechSection />
      <DoctorsSection />
      <PatientStoriesSection />
      <MissionSection />
      <Footer />
    </main>
  )
}
