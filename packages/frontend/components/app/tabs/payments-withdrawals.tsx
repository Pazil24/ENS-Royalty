"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDown, Download } from "lucide-react"

export function PaymentsWithdrawals() {
  const transactions = [
    { date: "Nov 23, 2024", type: "Deposit Received", subdomain: "vip.brand.eth", amount: "1.5", status: "Confirmed" },
    { date: "Nov 20, 2024", type: "Withdrawal", subdomain: "sponsor.creator.eth", amount: "0.8", status: "Confirmed" },
    {
      date: "Nov 18, 2024",
      type: "Deposit Received",
      subdomain: "premium.brand.eth",
      amount: "2.1",
      status: "Confirmed",
    },
    { date: "Nov 15, 2024", type: "Withdrawal", subdomain: "vip.brand.eth", amount: "1.2", status: "Confirmed" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments & Withdrawals</h1>
        <p className="text-muted-foreground">Manage your ETH withdrawals and payment history</p>
      </div>

      {/* Pending Withdrawals */}
      <Card className="glass-border p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Available to Claim</p>
            <p className="text-4xl font-bold">
              2.45 <span className="text-lg text-muted-foreground">ETH</span>
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">
            <ArrowDown className="mr-2 w-4 h-4" /> Withdraw All
          </Button>
        </div>
      </Card>

      {/* Breakdown Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">Withdrawal Breakdown</h2>
        <Card className="glass-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/5">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Subdomain</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Your Share</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-primary/5 transition">
                  <td className="py-3 px-4 font-mono text-xs">vip.brand.eth</td>
                  <td className="py-3 px-4">70%</td>
                  <td className="py-3 px-4 font-semibold">1.05 ETH</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      Withdraw
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-primary/5 transition">
                  <td className="py-3 px-4 font-mono text-xs">sponsor.creator.eth</td>
                  <td className="py-3 px-4">80%</td>
                  <td className="py-3 px-4 font-semibold">0.8 ETH</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      Withdraw
                    </Button>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 transition">
                  <td className="py-3 px-4 font-mono text-xs">premium.brand.eth</td>
                  <td className="py-3 px-4">50%</td>
                  <td className="py-3 px-4 font-semibold">0.6 ETH</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      Withdraw
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Transaction History</h2>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
        <Card className="glass-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-primary/5">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Subdomain</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr
                    key={idx}
                    className={
                      idx < transactions.length - 1
                        ? "border-b border-border/50 hover:bg-primary/5"
                        : "hover:bg-primary/5"
                    }
                  >
                    <td className="py-3 px-4 text-muted-foreground">{tx.date}</td>
                    <td className="py-3 px-4">{tx.type}</td>
                    <td className="py-3 px-4 font-mono text-xs">{tx.subdomain}</td>
                    <td className="py-3 px-4 font-semibold">{tx.amount} ETH</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">{tx.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
