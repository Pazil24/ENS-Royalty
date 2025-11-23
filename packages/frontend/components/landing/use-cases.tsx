"use client"

import { Megaphone, Crown, Users } from "lucide-react"

export function UseCasesSection() {
  const useCases = [
    {
      icon: Megaphone,
      title: "Influencer Endorsements",
      example: 'Own "creator.eth"? Sell "sponsor.creator.eth" with 20% lifetime commission',
      description: "Monetize your influence with permanent revenue sharing agreements",
    },
    {
      icon: Crown,
      title: "Brand Memberships",
      example: 'Create "vip.brand.eth", "premium.brand.eth" with tiered royalties',
      description: "Build membership tiers with different revenue sharing levels",
    },
    {
      icon: Users,
      title: "DAO Revenue Streams",
      example: 'Distribute "project.dao.eth" revenue among token holders',
      description: "Transparent, automatic distribution of treasury revenue",
    },
  ]

  return (
    <section id="use-cases" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">Use Cases</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          From individual creators to entire organizations
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon
            return (
              <div key={idx} className="glass-border rounded-xl p-8 hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4 border border-primary/30">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                <p className="text-sm text-primary mb-3 font-mono">{useCase.example}</p>
                <p className="text-muted-foreground text-sm">{useCase.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
