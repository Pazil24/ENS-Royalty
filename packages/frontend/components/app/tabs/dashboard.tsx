"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Lock, Unlock, ExternalLink } from "lucide-react"
import { useAccount, useEnsName } from "wagmi"
import { useState, useEffect } from "react"
import { formatEther } from "viem"
import { sepolia } from "viem/chains"
import { Button } from "@/components/ui/button"

interface Subdomain {
  name: string
  fullName: string
  owner: string
  isLocked: boolean
  beneficiaries: Array<{
    address: string
    share: string
    percentage: number
  }>
  parentRoyalty: number
  availableBalance: string
}

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ 
    address, 
    chainId: sepolia.id 
  })
  
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Mock data for demonstration - In production, fetch from contract events
  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false)
      return
    }
    
    // Simulate loading subdomains from contract
    setTimeout(() => {
      // This would be replaced with actual contract calls
      setSubdomains([
        {
          name: "shop",
          fullName: "shop.mybrand.eth",
          owner: address || "",
          isLocked: true,
          beneficiaries: [
            { address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", share: "5000", percentage: 50 },
            { address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", share: "3000", percentage: 30 },
            { address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0", share: "2000", percentage: 20 },
          ],
          parentRoyalty: 10,
          availableBalance: "0.5"
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [isConnected, address])
  
  const totalSubdomains = subdomains.length
  const totalPendingWithdrawals = subdomains.reduce((sum, sub) => 
    sum + parseFloat(sub.availableBalance), 0
  )
  const totalBeneficiaries = subdomains.reduce((sum, sub) => 
    sum + sub.beneficiaries.length, 0
  )
  
  const stats = [
    {
      title: "My ENS Domains",
      value: ensName || "Not registered",
      badge: isConnected ? "Connected" : "Disconnected",
      trend: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet",
    },
    {
      title: "Total Subdomains Created",
      value: totalSubdomains.toString(),
      badge: "Active",
      trend: `${subdomains.filter(s => s.isLocked).length} locked`,
    },
    {
      title: "Pending Withdrawals",
      value: totalPendingWithdrawals.toFixed(4),
      unit: "ETH",
      trend: totalPendingWithdrawals > 0 ? "Claim now" : "No balance",
    },
    {
      title: "Total Beneficiaries",
      value: totalBeneficiaries.toString(),
      trend: `Across ${totalSubdomains} subdomains`,
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

      {/* My Subdomains with Beneficiaries */}
      <div>
        <h2 className="text-xl font-bold mb-4">My ENS Subdomains & Beneficiaries</h2>
        
        {!isConnected ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground">Connect your wallet to view your subdomains</p>
          </Card>
        ) : isLoading ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground">Loading your subdomains...</p>
          </Card>
        ) : subdomains.length === 0 ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground mb-2">You haven't created any subdomains yet</p>
            <p className="text-sm text-muted-foreground">Go to "Create Subdomain" to get started</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {subdomains.map((subdomain, idx) => (
              <Card key={idx} className="glass-border p-6 hover:border-primary/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-lg font-bold font-mono">{subdomain.fullName}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Owner: {subdomain.owner.slice(0, 8)}...{subdomain.owner.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subdomain.isLocked ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/30">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs border border-accent/30">
                        <Unlock className="w-3 h-3" /> Unlocked
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Parent Royalty</p>
                    <p className="text-lg font-bold">{subdomain.parentRoyalty}%</p>
                  </div>
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                    <p className="text-lg font-bold">{subdomain.availableBalance} ETH</p>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Beneficiaries ({subdomain.beneficiaries.length})</h4>
                  </div>
                  <div className="space-y-2">
                    {subdomain.beneficiaries.map((beneficiary, bIdx) => (
                      <div key={bIdx} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                            {bIdx + 1}
                          </div>
                          <div>
                            <p className="font-mono text-xs">
                              {beneficiary.address.slice(0, 10)}...{beneficiary.address.slice(-8)}
                            </p>
                            <a 
                              href={`https://sepolia.etherscan.io/address/${beneficiary.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              View on Etherscan <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{beneficiary.percentage}%</p>
                          <p className="text-xs text-muted-foreground">{beneficiary.share} BPS</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {parseFloat(subdomain.availableBalance) > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                      Claim {subdomain.availableBalance} ETH
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Network Info */}
      <Card className="glass-border p-6 bg-accent/5 border-accent/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">ℹ️</span>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Sepolia Testnet</h3>
            <p className="text-sm text-muted-foreground">
              All ENS names and transactions are on Sepolia testnet. Make sure your ENS names are registered on Sepolia for resolution to work.
            </p>
          </div>
        </div>
      </Card>
      
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
                  <td className="py-3 px-4 font-mono text-xs">shop.mybrand.eth</td>
                  <td className="py-3 px-4">0.5 ETH</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">Confirmed</span>
                  </td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-primary/5 transition">
                  <td className="py-3 px-4">Nov 20, 2024</td>
                  <td className="py-3 px-4">Subdomain Created</td>
                  <td className="py-3 px-4 font-mono text-xs">shop.mybrand.eth</td>
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
