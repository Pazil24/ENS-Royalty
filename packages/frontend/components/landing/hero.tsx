"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function LandingHero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-6">
          <span className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-sm text-primary">
            Built for ETHGlobal Hackathon
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Turn Your ENS Name Into a Revenue Stream
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Create subdomains with immutable royalty splits. Monetize your web3 identity with cryptographic guarantees.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/app">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:scale-105 transition-all"
            >
              Launch App <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 bg-transparent">
            View Demo
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Immutable on-chain</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-accent mb-2">0</div>
            <div className="text-sm text-muted-foreground">Manual calculations</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              ∞
            </div>
            <div className="text-sm text-muted-foreground">Lifetime earnings</div>
          </div>
        </div>
      </div>
    </section>
  )
}
