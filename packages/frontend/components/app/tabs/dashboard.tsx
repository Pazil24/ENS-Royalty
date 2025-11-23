"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function Dashboard() {
  const stats = [
    {
      title: "Total Subdomains Owned",
      value: "3",
      badge: "Active",
      trend: "+2 this month",
    },
    {
      title: "Pending Withdrawals",
      value: "2.45",
      unit: "ETH",
      trend: "Claim now",
    },
    {
      title: "Royalty Tokens Held",
      value: "12",
      trend: "Across 3 subdomains",
    },
    {
      title: "Total Earned (All Time)",
      value: "15.82",
      unit: "ETH",
      trend: "+1.2 ETH this month",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your ENS royalty streams</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="glass-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                {stat.badge && (
                  <span className="inline-block mt-2 px-2 py-1 rounded-full bg-accent/20 border border-accent/50 text-xs text-accent">
                    {stat.badge}
                  </span>
                )}
              </div>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{stat.value}</span>
              {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{stat.trend}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <Card className="glass-border p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Event</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Subdomain</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-primary/5 transition">
                  <td className="py-3 px-4">Nov 23, 2024</td>
                  <td className="py-3 px-4">Payment Received</td>
                  <td className="py-3 px-4 font-mono text-xs">vip.brand.eth</td>
                  <td className="py-3 px-4">1.5 ETH</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">Confirmed</span>
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-primary/5 transition">
                  <td className="py-3 px-4">Nov 20, 2024</td>
                  <td className="py-3 px-4">Subdomain Created</td>
                  <td className="py-3 px-4 font-mono text-xs">sponsor.creator.eth</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">Confirmed</span>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 transition">
                  <td className="py-3 px-4">Nov 18, 2024</td>
                  <td className="py-3 px-4">ETH Withdrawn</td>
                  <td className="py-3 px-4 font-mono text-xs">premium.brand.eth</td>
                  <td className="py-3 px-4">0.8 ETH</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">Confirmed</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Your Subdomains Quick View */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Subdomains</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["vip.brand.eth", "sponsor.creator.eth", "premium.brand.eth"].map((domain, idx) => (
            <Card key={idx} className="glass-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold font-mono text-sm">{domain}</h3>
                  <span className="inline-block mt-2 px-2 py-1 rounded-full bg-primary/20 border border-primary/50 text-xs text-primary">
                    Owner
                  </span>
                </div>
              </div>
              <div className="py-3 border-t border-border mb-3">
                <p className="text-xs text-muted-foreground mb-2">Royalty Split</p>
                <div className="flex gap-1">
                  <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-primary to-primary/50" />
                  <div className="h-2 flex-1 rounded-full bg-accent/30" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">70% / 30% split</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
