"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, Lock, Info } from "lucide-react"
import { useAccount } from "wagmi"
import { useSubdomainFactory } from "@/hooks/use-ens-royalty"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Beneficiary {
  address: string
  share: number
}

export function CreateSubdomain() {
  const { address, isConnected } = useAccount()
  const { createSubdomain, createLockedSubdomain, isPending } = useSubdomainFactory()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    parentDomain: "",
    subdomainLabel: "",
    ownerAddress: address || "",
    royaltyPercent: "10",
    beneficiaries: [{ address: address || "", share: 10000 }] as Beneficiary[],
    isLocked: false,
  })

  const addBeneficiary = () => {
    setFormData({
      ...formData,
      beneficiaries: [...formData.beneficiaries, { address: "", share: 0 }],
    })
  }

  const removeBeneficiary = (idx: number) => {
    if (formData.beneficiaries.length === 1) {
      toast.error("Must have at least one beneficiary")
      return
    }
    setFormData({
      ...formData,
      beneficiaries: formData.beneficiaries.filter((_, i) => i !== idx),
    })
  }

  const updateBeneficiary = (idx: number, field: string, value: string | number) => {
    const updated = [...formData.beneficiaries]
    updated[idx] = { ...updated[idx], [field]: value }
    setFormData({ ...formData, beneficiaries: updated })
  }

  const totalShares = formData.beneficiaries.reduce((sum, b) => sum + (b.share || 0), 0)
  const totalPercentage = (totalShares / 100).toFixed(2)

  const handleCreateSubdomain = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      // Validate total shares = 10000 (100%)
      if (totalShares !== 10000) {
        toast.error(`Total shares must equal 10000 (100%). Current: ${totalShares}`)
        return
      }

      // Validate addresses
      const invalidAddress = formData.beneficiaries.find((b) => !b.address || !b.address.startsWith("0x"))
      if (invalidAddress) {
        toast.error("All beneficiary addresses must be valid")
        return
      }

      if (!formData.ownerAddress || !formData.ownerAddress.startsWith("0x")) {
        toast.error("Owner address must be valid")
        return
      }

      const beneficiaryAddresses = formData.beneficiaries.map((b) => b.address)
      const beneficiaryShares = formData.beneficiaries.map((b) => b.share)

      toast.loading("Creating subdomain...")

      let hash
      if (formData.isLocked) {
        hash = await createLockedSubdomain(
          formData.parentDomain,
          formData.subdomainLabel,
          formData.ownerAddress,
          parseInt(formData.royaltyPercent),
          beneficiaryAddresses,
          beneficiaryShares,
        )
      } else {
        hash = await createSubdomain(
          formData.parentDomain,
          formData.subdomainLabel,
          formData.ownerAddress,
          parseInt(formData.royaltyPercent),
          beneficiaryAddresses,
          beneficiaryShares,
        )
      }

      toast.success(
        `Subdomain ${formData.subdomainLabel}.${formData.parentDomain} created! ${formData.isLocked ? "🔒" : ""}`,
        {
          description: `TX: ${hash?.slice(0, 10)}...`,
        },
      )

      // Reset form
      setFormData({
        parentDomain: "",
        subdomainLabel: "",
        ownerAddress: address || "",
        royaltyPercent: "10",
        beneficiaries: [{ address: address || "", share: 10000 }],
        isLocked: false,
      })
      setStep(1)
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to create subdomain", {
        description: error.message || "Transaction rejected",
      })
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Subdomain</h1>
        <p className="text-muted-foreground">Set up a new revenue stream with royalty splits</p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Shares are in basis points (10000 = 100%). Each beneficiary gets their proportional share of revenues.
        </AlertDescription>
      </Alert>

      {/* Step Indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${s <= step ? "bg-gradient-to-r from-primary to-accent" : "bg-border"}`}
          />
        ))}
      </div>

      <Card className="glass-border p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Parent Domain *</label>
              <input
                type="text"
                placeholder="mydomain.eth"
                value={formData.parentDomain}
                onChange={(e) => setFormData({ ...formData, parentDomain: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
              <p className="text-xs text-muted-foreground mt-1">The ENS domain you own</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subdomain Label *</label>
              <input
                type="text"
                placeholder="e.g., shop"
                value={formData.subdomainLabel}
                onChange={(e) => setFormData({ ...formData, subdomainLabel: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
              {formData.parentDomain && formData.subdomainLabel && (
                <p className="text-sm text-primary mt-2 font-mono">
                  → {formData.subdomainLabel}.{formData.parentDomain}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Owner Address *</label>
              <input
                type="text"
                placeholder="0x..."
                value={formData.ownerAddress}
                onChange={(e) => setFormData({ ...formData, ownerAddress: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
              <p className="text-xs text-muted-foreground mt-1">Who will own this subdomain</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parent Royalty % *</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="10"
                value={formData.royaltyPercent}
                onChange={(e) => setFormData({ ...formData, royaltyPercent: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of revenue sent to parent domain owner
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Beneficiaries & Revenue Split</h2>
            <p className="text-sm text-muted-foreground">Configure how revenue is split (must total 10000 = 100%)</p>

            <div className="space-y-3">
              {formData.beneficiaries.map((beneficiary, idx) => (
                <div key={idx} className="flex gap-3 items-end pb-3 border-b border-border">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={beneficiary.address}
                      onChange={(e) => updateBeneficiary(idx, "address", e.target.value)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
                    />
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Share (BPS)</label>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={beneficiary.share}
                      onChange={(e) => updateBeneficiary(idx, "share", Number.parseInt(e.target.value) || 0)}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition"
                    />
                  </div>
                  {formData.beneficiaries.length > 1 && (
                    <button
                      onClick={() => removeBeneficiary(idx)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addBeneficiary}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition"
            >
              <Plus className="w-4 h-4" /> Add Beneficiary
            </button>

            <div
              className={`border rounded-lg p-4 ${
                totalShares === 10000
                  ? "bg-primary/5 border-primary/30"
                  : "bg-destructive/5 border-destructive/30"
              }`}
            >
              <p className="text-sm font-medium mb-2">
                Total: {totalShares} BPS ({totalPercentage}%)
              </p>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    totalShares === 10000 ? "bg-gradient-to-r from-primary to-accent" : "bg-destructive"
                  }`}
                  style={{ width: `${Math.min((totalShares / 10000) * 100, 100)}%` }}
                />
              </div>
              {totalShares !== 10000 && (
                <p className="text-xs text-destructive mt-2">Total must equal 10000 (100%)</p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Security Options</h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                  className="w-4 h-4 mt-1"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    <p className="font-medium text-sm">Lock Royalty Configuration</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make royalty terms immutable forever. This creates trust and transparency but CANNOT be undone.
                  </p>
                </div>
              </label>
            </div>

            {formData.isLocked && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive">
                  ⚠️ Warning: Once locked, royalty settings CANNOT be changed by anyone
                </p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Review & Confirm</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Subdomain:</span>
                <span className="font-mono font-semibold">
                  {formData.subdomainLabel || "?"}.{formData.parentDomain || "?"}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Owner:</span>
                <span className="font-mono text-xs">
                  {formData.ownerAddress ? `${formData.ownerAddress.slice(0, 6)}...${formData.ownerAddress.slice(-4)}` : "?"}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Parent Royalty:</span>
                <span className="font-semibold">{formData.royaltyPercent}%</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Beneficiaries:</span>
                <span className="font-semibold">{formData.beneficiaries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Locked:</span>
                <span className={formData.isLocked ? "text-destructive font-semibold" : "text-muted-foreground"}>
                  {formData.isLocked ? "Yes 🔒" : "No"}
                </span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-4 space-y-2">
              <p className="text-sm text-primary font-medium">Beneficiary Breakdown:</p>
              {formData.beneficiaries.map((b, idx) => (
                <div key={idx} className="text-xs flex justify-between">
                  <span className="font-mono">{b.address.slice(0, 10)}...</span>
                  <span className="font-semibold">{b.share} BPS ({(b.share / 100).toFixed(2)}%)</span>
                </div>
              ))}
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-sm font-medium">Ready to deploy on Sepolia testnet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated gas cost will be shown in your wallet
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isPending}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
              disabled={
                (step === 1 && (!formData.parentDomain || !formData.subdomainLabel || !formData.ownerAddress)) ||
                (step === 2 && totalShares !== 10000)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleCreateSubdomain}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
              disabled={isPending || !isConnected}
            >
              {isPending ? "Creating..." : `Create ${formData.isLocked ? "Locked " : ""}Subdomain`}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
