"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount } from "wagmi"
import { usePaymentSplitter } from "@/hooks/use-ens-royalty"
import { toast } from "sonner"
import { Send, Info } from "lucide-react"

export function Payments() {
  const { address, isConnected } = useAccount()
  const { sendRevenue, isPending } = usePaymentSplitter()

  const [sendForm, setForm] = useState({
    namehash: "",
    amount: "",
  })

  const handleSendRevenue = async () => {
    if (!sendForm.namehash || !sendForm.amount) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      toast.loading("Distributing payment to beneficiaries...")
      const hash = await sendRevenue(sendForm.namehash, sendForm.amount)
      toast.success("Payment distributed!", {
        description: `Funds sent directly to all beneficiaries. TX: ${hash?.slice(0, 10)}...`,
      })
      setForm({ namehash: "", amount: "" })
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to send payment", {
        description: error.message || "Transaction rejected",
      })
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Revenue Distribution</h1>
          <p className="text-muted-foreground">Send payments that automatically split among beneficiaries</p>
        </div>
        <Card className="glass-border p-12 text-center">
          <p className="text-muted-foreground">Connect your wallet to send payments</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Revenue Distribution</h1>
        <p className="text-muted-foreground">Send payments that automatically split among beneficiaries</p>
      </div>

      {/* Info Card */}
      <Card className="glass-border p-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Automatic Distribution
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Payments are automatically split and sent directly to all beneficiaries based on their configured shares. 
              No manual claiming required!
            </p>
          </div>
        </div>
      </Card>

      {/* Send Revenue */}
      <Card className="glass-border p-6">
        <h2 className="text-xl font-bold mb-4">Send Payment to Subdomain</h2>
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
              The namehash of the subdomain - payment will be split among all configured beneficiaries
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
            <p className="text-xs text-muted-foreground">
              This amount will be automatically distributed to beneficiaries based on their share percentages
            </p>
          </div>

          <Button
            onClick={handleSendRevenue}
            disabled={isPending}
            className="w-full bg-gradient-to-r from-primary to-accent"
          >
            <Send className="w-4 h-4 mr-2" />
            {isPending ? "Distributing..." : "Send & Distribute Payment"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
