"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, Lock } from "lucide-react"

export function MySubdomains() {
  const subdomains = [
    {
      name: "vip.brand.eth",
      owner: true,
      split: [70, 30],
      labels: ["70% Owner", "30% Partner"],
      locked: true,
      pending: "0.5 ETH",
    },
    {
      name: "sponsor.creator.eth",
      owner: true,
      split: [80, 20],
      labels: ["80% Creator", "20% Sponsor"],
      locked: false,
      pending: "1.2 ETH",
    },
    {
      name: "premium.brand.eth",
      owner: true,
      split: [50, 30, 20],
      labels: ["50% Brand", "30% Partner 1", "20% Partner 2"],
      locked: true,
      pending: "0",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Subdomains</h1>
        <p className="text-muted-foreground">Manage your created revenue streams</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subdomains..."
            className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Subdomains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subdomains.map((domain, idx) => (
          <Card key={idx} className="glass-border p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold font-mono text-sm mb-2">{domain.name}</h3>
                {domain.owner && (
                  <span className="inline-block px-2 py-1 rounded-full bg-primary/20 border border-primary/50 text-xs text-primary">
                    Owner
                  </span>
                )}
              </div>
              {domain.locked && <Lock className="w-4 h-4 text-accent" />}
            </div>

            {/* Split Visualization */}
            <div className="py-4 border-t border-border mb-4">
              <p className="text-xs text-muted-foreground mb-2">Royalty Split</p>
              <div className="flex gap-1 mb-2">
                {domain.split.map((percent, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ flex: percent }}
                  />
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {domain.labels.map((label, i) => (
                  <span key={i} className="text-xs text-muted-foreground">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Pending Balance */}
            <div className="py-4 border-t border-border mb-4">
              <p className="text-xs text-muted-foreground">Pending Balance</p>
              <p className="text-lg font-bold text-accent">{domain.pending}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                View Details
              </Button>
              {domain.pending !== "0" && (
                <Button size="sm" className="flex-1 text-xs bg-gradient-to-r from-primary to-accent">
                  Claim
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
