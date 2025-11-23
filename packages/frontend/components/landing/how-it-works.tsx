"use client"

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Create Subdomain",
      description: "Input parent domain, subdomain name, and beneficiaries",
    },
    {
      number: 2,
      title: "Set Royalty Split",
      description: "Define percentages (e.g., 70/30, 50/30/20)",
    },
    {
      number: 3,
      title: "Lock Fuses",
      description: "Make royalty terms immutable on-chain",
    },
    {
      number: 4,
      title: "Earn Automatically",
      description: "Receive ETH whenever subdomain generates revenue",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          4 simple steps to create and monetize your revenue stream
        </p>

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent">
                  <span className="text-white font-bold">{step.number}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
