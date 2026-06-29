import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/base/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import "@/styles/globals.css"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "HealthCare Hospital — Expert Medical Care",
  description:
    "Experience compassionate healthcare from experienced specialists. Advanced medical treatments, AI-powered consultation, and personalized care plans.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
