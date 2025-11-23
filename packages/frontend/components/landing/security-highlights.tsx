"use client"

export function SecurityHighlights() {
  const highlights = [
    { title: "Deployed on Sepolia", link: "Etherscan" },
    { title: "23/23 Tests Passing", link: "GitHub" },
    { title: "Built with OpenZeppelin", link: "Docs" },
    { title: "Open Source & Auditable", link: "Repository" },
  ]

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Security & Transparency</h2>

        <div className="glass-border rounded-xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((highlight, idx) => (
              <div key={idx} className="text-center">
                <div className="mb-2">
                  <svg className="w-6 h-6 text-accent mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-sm">{highlight.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
