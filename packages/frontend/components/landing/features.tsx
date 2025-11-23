"use client"

import { Lock, Zap, Gem } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Lock,
      title: "Cryptographically Immutable",
      description:
        "Fuse locks prevent anyone from changing royalty terms. Parent domains earn automatic commissions forever.",
    },
    {
      icon: Zap,
      title: "Automated Distribution",
      description: "ETH payments automatically split among token holders. No manual calculations or trust required.",
    },
    {
      icon: Gem,
      title: "ERC1155 Royalty Tokens",
      description: "Tradeable shares representing payment rights. Supply can be locked to prevent dilution.",
    },
  ]

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Core Features</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Built with blockchain-native capabilities for trustless, transparent operations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="glass-border rounded-xl p-8 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
