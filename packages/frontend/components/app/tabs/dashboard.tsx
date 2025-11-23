"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Lock, Unlock, ExternalLink, Globe, ChevronDown, ChevronUp, Send, Wallet } from "lucide-react"
import { useAccount, useEnsName, useReadContracts } from "wagmi"
import { useState, useEffect } from "react"
import { formatEther, namehash } from "viem"
import { sepolia } from "viem/chains"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CONTRACTS } from "@/lib/config/contracts"
import SubdomainFactoryABI from "@/lib/abis/SubdomainFactory.json"
import { useSubdomains } from "@/lib/context/SubdomainContext"
import { usePaymentSplitter, useBeneficiariesConfig } from "@/hooks/use-ens-royalty"
import { toast } from "sonner"

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
  parentDomain: string
}

interface ENSDomain {
  name: string
  subdomains: Subdomain[]
  totalSubdomains: number
  isExpanded: boolean
}

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { data: ensName } = useEnsName({ 
    address, 
    chainId: sepolia.id 
  })
  
  const { subdomains: contextSubdomains } = useSubdomains()
  const [ensDomains, setEnsDomains] = useState<ENSDomain[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubdomain, setSelectedSubdomain] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  
  const { sendRevenue, isPending } = usePaymentSplitter()
  
  const handleSendPayment = async () => {
    if (!selectedSubdomain || !paymentAmount) {
      toast.error("Please enter a payment amount")
      return
    }

    try {
      console.log("🔵 Sending payment to subdomain:", selectedSubdomain)
      console.log("🔵 Amount:", paymentAmount, "ETH")
      console.log("🔵 Namehash will be:", namehash(selectedSubdomain))
      
      const hash = await sendRevenue(selectedSubdomain, paymentAmount)
      
      console.log("✅ Payment transaction hash:", hash)
      toast.success("Payment sent successfully!")
      toast.info(
        <a 
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          View on Etherscan: {hash.slice(0, 10)}...{hash.slice(-8)}
        </a>
      )
      setShowPaymentDialog(false)
      setPaymentAmount("")
      setSelectedSubdomain(null)
    } catch (error: any) {
      console.error("❌ Payment error:", error)
      toast.error(error?.message || "Failed to send payment")
    }
  }
  
  // Update ENS domains when context subdomains change
  useEffect(() => {
    if (!isConnected) {
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    
    // Group subdomains by parent domain
    const domainMap = new Map<string, Subdomain[]>()
    contextSubdomains.forEach(sub => {
      if (!domainMap.has(sub.parentDomain)) {
        domainMap.set(sub.parentDomain, [])
      }
      domainMap.get(sub.parentDomain)!.push(sub as Subdomain)
    })
    
    const domains: ENSDomain[] = Array.from(domainMap.entries()).map(([domainName, subs]) => ({
      name: domainName,
      subdomains: subs,
      totalSubdomains: subs.length,
      isExpanded: true // Auto-expand to show new subdomains
    }))
    
    setEnsDomains(domains)
    setIsLoading(false)
  }, [isConnected, contextSubdomains])
  
  const toggleDomain = (domainName: string) => {
    setEnsDomains(prev => prev.map(d => 
      d.name === domainName ? { ...d, isExpanded: !d.isExpanded } : d
    ))
  }
  
  const totalSubdomains = contextSubdomains.length
  const totalPendingWithdrawals = contextSubdomains.reduce((sum, sub) => 
    sum + parseFloat(sub.availableBalance), 0
  )
  const totalBeneficiaries = contextSubdomains.reduce((sum, sub) => 
    sum + sub.beneficiaries.length, 0
  )
  
  const stats = [
    {
      title: "My ENS Domains",
      value: ensDomains.length > 0 ? ensDomains.length.toString() : (ensName ? "1" : "0"),
      badge: isConnected ? "Connected" : "Disconnected",
      trend: ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet"),
    },
    {
      title: "Total Subdomains Delegated",
      value: totalSubdomains.toString(),
      badge: "Active",
      trend: `${contextSubdomains.filter(s => s.isLocked).length} locked`,
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
      trend: `Across ${ensDomains.length} domains`,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your ENS domains and delegated subdomains on Sepolia testnet</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
          <Card key={idx} className="glass-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                {stat.badge && (
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                    isConnected 
                      ? "bg-accent/20 border border-accent/50 text-accent"
                      : "bg-muted border border-border text-muted-foreground"
                  }`}>
                    {stat.badge}
                  </span>
                )}
              </div>
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold truncate">{stat.value}</span>
              {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-3 truncate">{stat.trend}</p>
          </Card>
        ))}
      </div>

      {/* My ENS Domains with Subdomains */}
      <div>
        <h2 className="text-xl font-bold mb-4">My ENS Domains & Delegated Subdomains</h2>
        
        {!isConnected ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground">Connect your wallet to view your ENS domains</p>
          </Card>
        ) : isLoading ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground">Loading your ENS domains...</p>
          </Card>
        ) : ensDomains.length === 0 ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground mb-2">No ENS domains with subdomains found</p>
            <p className="text-sm text-muted-foreground">Create a subdomain to get started</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {ensDomains.map((domain, idx) => (
              <Card key={idx} className="glass-border overflow-hidden">
                {/* Domain Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-primary/5 transition flex items-center justify-between"
                  onClick={() => toggleDomain(domain.name)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-mono">{domain.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {domain.totalSubdomains} subdomain{domain.totalSubdomains !== 1 ? 's' : ''} delegated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/50 text-accent text-sm font-medium">
                      {domain.totalSubdomains} active
                    </span>
                    {domain.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Expanded Subdomains List */}
                {domain.isExpanded && (
                  <div className="border-t border-border bg-muted/20">
                    <div className="p-6 space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Delegated Subdomains
                      </h4>
                      {domain.subdomains.map((subdomain, subIdx) => (
                        <Card key={subIdx} className="bg-background border-border/50 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h5 className="text-base font-bold font-mono">{subdomain.fullName}</h5>
                              <p className="text-xs text-muted-foreground mt-1">
                                Owner: {subdomain.owner.slice(0, 8)}...{subdomain.owner.slice(-6)}
                              </p>
                            </div>
                            {subdomain.isLocked ? (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs border border-destructive/30">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-xs border border-accent/30">
                                <Unlock className="w-3 h-3" /> Unlocked
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="bg-primary/5 border border-primary/20 rounded p-2">
                              <p className="text-xs text-muted-foreground">Parent Royalty</p>
                              <p className="text-sm font-bold">{subdomain.parentRoyalty}%</p>
                            </div>
                            <div className="bg-accent/5 border border-accent/20 rounded p-2">
                              <p className="text-xs text-muted-foreground">Beneficiaries</p>
                              <p className="text-sm font-bold">{subdomain.beneficiaries.length}</p>
                            </div>
                            <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                              <p className="text-xs text-muted-foreground">Balance</p>
                              <p className="text-sm font-bold">{subdomain.availableBalance} ETH</p>
                            </div>
                          </div>
                          
                          <div className="border-t border-border pt-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">BENEFICIARIES:</p>
                            <div className="space-y-2">
                              {subdomain.beneficiaries.map((beneficiary, bIdx) => (
                                <div key={bIdx} className="flex items-center justify-between text-xs">
                                  <span className="font-mono text-muted-foreground">
                                    {beneficiary.address.slice(0, 8)}...{beneficiary.address.slice(-6)}
                                  </span>
                                  <span className="font-bold">{beneficiary.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-border flex gap-2">
                            <Button 
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                              onClick={() => {
                                setSelectedSubdomain(subdomain.fullName)
                                setShowPaymentDialog(true)
                              }}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Send Payment
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Subdomain View (Legacy - kept for compatibility) */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Subdomains Details</h2>
        
        {!isConnected ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground">Connect your wallet to view your subdomains</p>
          </Card>
        ) : isLoading ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground">Loading your subdomains...</p>
          </Card>
        ) : contextSubdomains.length === 0 ? (
          <Card className="glass-border p-8 text-center">
            <p className="text-muted-foreground mb-2">You haven't created any subdomains yet</p>
            <p className="text-sm text-muted-foreground">Go to "Create Subdomain" to get started</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {contextSubdomains.map((subdomain, idx) => (
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
                {contextSubdomains.length > 0 ? (
                  contextSubdomains.slice(0, 3).map((sub, idx) => (
                    <tr key={idx} className={idx < 2 ? "border-b border-border/50 hover:bg-primary/5 transition" : "hover:bg-primary/5 transition"}>
                      <td className="py-3 px-4">{new Date(sub.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="py-3 px-4">Subdomain Created</td>
                      <td className="py-3 px-4 font-mono text-xs">{sub.fullName}</td>
                      <td className="py-3 px-4">-</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs">Confirmed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No activity yet - create your first subdomain!
                    </td>
                  </tr>
                )}
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
      
      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment to Subdomain</DialogTitle>
            <DialogDescription>
              Send ETH to <span className="font-mono text-primary">{selectedSubdomain}</span>. 
              The payment will be automatically split among all beneficiaries according to their shares.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={selectedSubdomain || ""}
                disabled
                className="font-mono text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (ETH) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                placeholder="0.1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: 0.001 ETH | Payment will be automatically distributed to all beneficiaries
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowPaymentDialog(false)
                setPaymentAmount("")
                setSelectedSubdomain(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSendPayment}
              disabled={isPending || !paymentAmount}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isPending ? "Sending..." : "Send Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
