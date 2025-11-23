"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount } from "wagmi"
import { usePaymentSplitter, useAvailableBalance, useTotalDistributed } from "@/hooks/use-ens-royalty"
import { toast } from "sonner"
import { formatEther, parseEther } from "viem"
import { ArrowDownToLine, Send, TrendingUp } from "lucide-react"

export function Payments() {
  const { address, isConnected } = useAccount()
  const { sendRevenue, distributeRoyalties, claimBalance, isPending } = usePaymentSplitter()

  const [sendForm, setForm] = useState({
    namehash: "",
    amount: "",
  })

  const [distributeNamehash, setDistributeNamehash] = useState("")
  const [claimNamehash, setClaimNamehash] = useState("")

  // Get balances for display (you'd need to pass actual namehashes)
  const availableBalance = useAvailableBalance(claimNamehash || "0x0", address!)
  const totalDistributed = useTotalDistributed(claimNamehash || "0x0")

  const handleSendRevenue = async () => {
    if (!sendForm.namehash || !sendForm.amount) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      toast.loading("Sending revenue...")
      const hash = await sendRevenue(sendForm.namehash, sendForm.amount)
      toast.success("Revenue sent!", {
        description: `TX: ${hash?.slice(0, 10)}...`,
      })
      setForm({ namehash: "", amount: "" })
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to send revenue", {
        description: error.message || "Transaction rejected",
      })
    }
  }

  const handleDistribute = async () => {
    if (!distributeNamehash) {
      toast.error("Please enter a namehash")
      return
    }

    try {
      toast.loading("Distributing royalties...")
      const hash = await distributeRoyalties(distributeNamehash)
      toast.success("Royalties distributed!", {
        description: `TX: ${hash?.slice(0, 10)}...`,
      })
      setDistributeNamehash("")
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to distribute", {
        description: error.message || "Transaction rejected",
      })
    }
  }

  const handleClaim = async () => {
    if (!claimNamehash) {
      toast.error("Please enter a namehash")
      return
    }

    try {
      toast.loading("Claiming balance...")
      const hash = await claimBalance(claimNamehash)
      toast.success("Balance claimed!", {
        description: `TX: ${hash?.slice(0, 10)}...`,
      })
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to claim", {
        description: error.message || "Transaction rejected",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Payments & Withdrawals</h1>
          <p className="text-muted-foreground">Manage revenue distribution and claims</p>
        </div>
        <Card className="glass-border p-12 text-center">
          <p className="text-muted-foreground">Connect your wallet to manage payments</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments & Withdrawals</h1>
        <p className="text-muted-foreground">Manage revenue distribution and claims</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <ArrowDownToLine className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
          </div>
          <p className="text-2xl font-bold">
            {availableBalance.balance} ETH
          </p>
        </Card>

        <Card className="glass-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Total Distributed</p>
          </div>
          <p className="text-2xl font-bold">
            {totalDistributed.total} ETH
          </p>
        </Card>

        <Card className="glass-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Send className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Active Streams</p>
          </div>
          <p className="text-2xl font-bold">2</p>
        </Card>
      </div>

      {/* Send Revenue */}
      <Card className="glass-border p-6">
        <h2 className="text-xl font-bold mb-4">Send Revenue to Subdomain</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sendNamehash">Subdomain Namehash *</Label>
            <Input
              id="sendNamehash"
              placeholder="0x..."
              value={sendForm.namehash}
              onChange={(e) => setForm({ ...sendForm, namehash: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              The namehash of the subdomain to receive revenue
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sendAmount">Amount (ETH) *</Label>
            <Input
              id="sendAmount"
              type="number"
              step="0.001"
              placeholder="0.1"
              value={sendForm.amount}
              onChange={(e) => setForm({ ...sendForm, amount: e.target.value })}
            />
          </div>

          <Button
            onClick={handleSendRevenue}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            {isPending ? "Sending..." : "Send Revenue"}
          </Button>
        </div>
      </Card>

      {/* Distribute Royalties */}
      <Card className="glass-border p-6">
        <h2 className="text-xl font-bold mb-4">Distribute Royalties</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Trigger distribution of accumulated revenue to all beneficiaries
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distributeNamehash">Subdomain Namehash *</Label>
            <Input
              id="distributeNamehash"
              placeholder="0x..."
              value={distributeNamehash}
              onChange={(e) => setDistributeNamehash(e.target.value)}
            />
          </div>

          <Button
            onClick={handleDistribute}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-accent to-primary"
          >
            {isPending ? "Distributing..." : "Distribute Royalties"}
          </Button>
        </div>
      </Card>

      {/* Claim Balance */}
      <Card className="glass-border p-6">
        <h2 className="text-xl font-bold mb-4">Claim Your Balance</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Withdraw your available balance from a subdomain
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimNamehash">Subdomain Namehash *</Label>
            <Input
              id="claimNamehash"
              placeholder="0x..."
              value={claimNamehash}
              onChange={(e) => setClaimNamehash(e.target.value)}
            />
          </div>

          <Button
            onClick={handleClaim}
            disabled={isPending || !availableBalance.balanceRaw || availableBalance.balanceRaw === BigInt(0)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600"
          >
            {isPending ? "Claiming..." : `Claim ${availableBalance.balance} ETH`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
