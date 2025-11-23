import type { Metadata } from "next"
import { LandingHero } from "@/components/landing/hero"
import { FeaturesSection } from "@/components/landing/features"
import { UseCasesSection } from "@/components/landing/use-cases"
import { HowItWorks } from "@/components/landing/how-it-works"
import { SecurityHighlights } from "@/components/landing/security-highlights"
import { LandingFooter } from "@/components/landing/footer"
import { SiteHeader } from "@/components/landing/header"

export const metadata: Metadata = {
  title: "ENS Royalty System | Programmable Revenue Streams",
  description:
    "Turn your ENS name into a revenue stream. Create subdomains with immutable royalty splits and earn ETH automatically.",
}

export const dynamic = "force-static"

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95 text-foreground overflow-x-hidden">
      <SiteHeader />
      <LandingHero />
      <FeaturesSection />
      <UseCasesSection />
      <HowItWorks />
      <SecurityHighlights />
      <LandingFooter />
    </main>
  )
}
