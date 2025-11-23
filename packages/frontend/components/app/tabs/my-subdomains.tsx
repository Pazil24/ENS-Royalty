"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, Lock, ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"
import { useRoyaltyConfig, useAvailableBalance, usePaymentSplitter } from "@/hooks/use-ens-royalty"
import { toast } from "sonner"
import { formatEther } from "viem"

export function MySubdomains() {
  const { address, isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("")
  
  // Mock subdomain list - in a real app, you'd get this from The Graph or events
  const mySubdomains = [
    { name: "vip.brand.eth", namehash: "0x..." }, // Replace with actual namehashes
    { name: "sponsor.creator.eth", namehash: "0x..." },
  ]

  const filteredSubdomains = mySubdomains.filter((domain) =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Subdomains</h1>
        <p className="text-muted-foreground">Manage your created revenue streams</p>
      </div>

      {!isConnected && (
        <Card className="glass-border p-6 text-center">
          <p className="text-muted-foreground">Connect your wallet to view your subdomains</p>
        </Card>
      )}

      {isConnected && (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search subdomains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
          {/* Subdomains Grid */}
          {filteredSubdomains.length === 0 && (
            <Card className="glass-border p-12 text-center">
              <p className="text-lg text-muted-foreground mb-2">No subdomains found</p>
              <p className="text-sm text-muted-foreground">Create your first subdomain to get started</p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubdomains.map((domain, idx) => (
              <SubdomainCard key={idx} domain={domain} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SubdomainCard({ domain }: { domain: { name: string; namehash: string } }) {
  const { address } = useAccount()
  const royaltyConfig = useRoyaltyConfig(domain.namehash)
  const availableBalance = useAvailableBalance(domain.namehash, address!)
  const { claimBalance, isPending } = usePaymentSplitter()

  const handleClaim = async () => {
    try {
      toast.loading("Claiming balance...")
      const hash = await claimBalance(domain.namehash)
      toast.success("Balance claimed!", {
        description: `TX: ${hash?.slice(0, 10)}...`,
      })
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to claim balance", {
        description: error.message || "Transaction rejected",
      })
    }
  }

  const hasBalance = availableBalance.balanceRaw && availableBalance.balanceRaw > BigInt(0)

  return (
    <Card className="glass-border p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold font-mono text-sm mb-2">{domain.name}</h3>
          <span className="inline-block px-2 py-1 rounded-full bg-primary/20 border border-primary/50 text-xs text-primary">
            Owner
          </span>
        </div>
        {royaltyConfig.data?.isLocked && <Lock className="w-4 h-4 text-accent" />}
      </div>

      {/* Split Visualization */}
      {royaltyConfig.data && (
        <div className="py-4 border-t border-border mb-4">
          <p className="text-xs text-muted-foreground mb-2">Royalty Split</p>
          <div className="flex gap-1 mb-2">
            {royaltyConfig.data.shares.map((share, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ flex: Number(share) }}
                title={`${(Number(share) / 100).toFixed(2)}%`}
              />
            ))}
          </div>
          <div className="space-y-1">
            {royaltyConfig.data.beneficiaries.map((addr, i) => (
              <div key={i} className="text-xs text-muted-foreground flex justify-between">
                <span className="font-mono">
                  {addr.slice(0, 6)}...{addr.slice(-4)}
                </span>
                <span>{(Number(royaltyConfig.data?.shares[i]) / 100).toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Balance */}
      <div className="py-4 border-t border-border mb-4">
        <p className="text-xs text-muted-foreground">Available Balance</p>
        <p className="text-lg font-bold text-accent">
          {availableBalance.balance} ETH
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs bg-transparent"
          onClick={() =>
            window.open(`https://sepolia.etherscan.io/name-lookup-search?id=${domain.name}`, "_blank")
          }
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View on ENS
        </Button>
        {hasBalance && (
          <Button
            size="sm"
            className="flex-1 text-xs bg-gradient-to-r from-primary to-accent"
            onClick={handleClaim}
            disabled={isPending}
          >
            {isPending ? "Claiming..." : "Claim"}
          </Button>
        )}
      </div>
    </Card>
  )
}
