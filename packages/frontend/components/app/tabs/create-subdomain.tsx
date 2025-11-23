"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X, Lock, Info, CheckCircle2 } from "lucide-react"
import { useAccount, useEnsAddress, useEnsName } from "wagmi"
import { useSubdomainFactory } from "@/hooks/use-ens-royalty"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { normalize } from "viem/ens"
import { sepolia } from "viem/chains"

interface Beneficiary {
  input: string // Can be ENS name or address
  resolvedAddress: string | null
  sharePercent: string // Share in percentage (0-100)
  isResolving: boolean
  isResolved: boolean
}

export function CreateSubdomain() {
  const { address, isConnected } = useAccount()
  const { createSubdomain, createLockedSubdomain, isPending } = useSubdomainFactory()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    parentDomain: "",
    subdomainLabel: "",
    ownerInput: "", // Can be ENS or address
    ownerAddress: "",
    royaltyPercent: "10",
    beneficiaries: [{ input: "", resolvedAddress: null, sharePercent: "100", isResolving: false, isResolved: false }] as Beneficiary[],
    isLocked: false,
  })

  // Auto-populate owner with connected wallet address
  useEffect(() => {
    if (address && !formData.ownerInput) {
      setFormData(prev => ({ ...prev, ownerInput: address, ownerAddress: address }))
    }
  }, [address])

  // ENS resolution hook for owner (Sepolia testnet)
  const { data: ownerEnsAddress, isLoading: isResolvingOwner } = useEnsAddress({
    name: formData.ownerInput?.endsWith('.eth') ? normalize(formData.ownerInput) : undefined,
    chainId: sepolia.id,
  })

  // Update owner address when ENS resolves
  useEffect(() => {
    if (formData.ownerInput?.startsWith('0x')) {
      setFormData(prev => ({ ...prev, ownerAddress: formData.ownerInput }))
    } else if (ownerEnsAddress) {
      setFormData(prev => ({ ...prev, ownerAddress: ownerEnsAddress }))
    }
  }, [ownerEnsAddress, formData.ownerInput])

  const addBeneficiary = () => {
    setFormData({
      ...formData,
      beneficiaries: [...formData.beneficiaries, { input: "", resolvedAddress: null, sharePercent: "0", isResolving: false, isResolved: false }],
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

  const updateBeneficiary = (idx: number, field: string, value: string) => {
    const updated = [...formData.beneficiaries]
    updated[idx] = { ...updated[idx], [field]: value }
    
    // Reset resolution when input changes
    if (field === 'input') {
      updated[idx].isResolved = false
      updated[idx].resolvedAddress = null
    }
    
    setFormData({ ...formData, beneficiaries: updated })
  }

  const resolveBeneficiaryENS = async (idx: number) => {
    const beneficiary = formData.beneficiaries[idx]
    
    if (beneficiary.input.startsWith('0x')) {
      // It's already an address
      const updated = [...formData.beneficiaries]
      updated[idx] = { ...updated[idx], resolvedAddress: beneficiary.input, isResolved: true }
      setFormData({ ...formData, beneficiaries: updated })
      toast.success("Address validated")
      return
    }
    
    if (!beneficiary.input.endsWith('.eth')) {
      toast.error("Please enter a valid ENS name (ending with .eth) or 0x address")
      return
    }

    // Mark as resolving
    const updated = [...formData.beneficiaries]
    updated[idx] = { ...updated[idx], isResolving: true }
    setFormData({ ...formData, beneficiaries: updated })

    try {
      // Import required modules
      const { normalize } = await import('viem/ens')
      const { createPublicClient, http } = await import('viem')
      const { sepolia } = await import('viem/chains')
      
      // Create public client for ENS resolution on Sepolia testnet
      const client = createPublicClient({
        chain: sepolia,
        transport: http(), // Use default Sepolia RPC
      })
      
      // Resolve ENS name
      const address = await client.getEnsAddress({
        name: normalize(beneficiary.input),
      })
      
      if (address) {
        const updated = [...formData.beneficiaries]
        updated[idx] = { ...updated[idx], resolvedAddress: address, isResolving: false, isResolved: true }
        setFormData({ ...formData, beneficiaries: updated })
        toast.success(`✅ Resolved ${beneficiary.input} to ${address.slice(0, 6)}...${address.slice(-4)}`)
      } else {
        throw new Error("ENS name not found")
      }
    } catch (error: any) {
      console.error('ENS Resolution Error:', error)
      const updated = [...formData.beneficiaries]
      updated[idx] = { ...updated[idx], isResolving: false, isResolved: false, resolvedAddress: null }
      setFormData({ ...formData, beneficiaries: updated })
      toast.error(`Failed to resolve ${beneficiary.input}: ${error.message || 'Unknown error'}`)
    }
  }

  // Calculate total percentage
  const totalPercent = formData.beneficiaries.reduce((sum, b) => sum + parseFloat(b.sharePercent || "0"), 0)
  
  // Convert percentage to BPS (basis points) for smart contract
  const percentToBps = (percent: number) => {
    return Math.round(percent * 100) // 1% = 100 BPS, 50% = 5000 BPS, 100% = 10000 BPS
  }

  const handleCreateSubdomain = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    try {
      // Validate total percentage = 100%
      if (totalPercent !== 100) {
        toast.error(`Total percentage must equal 100%. Current total: ${totalPercent.toFixed(2)}%`)
        return
      }

      // Validate all beneficiaries are resolved
      const unresolvedBeneficiary = formData.beneficiaries.find(b => !b.resolvedAddress || !b.isResolved)
      if (unresolvedBeneficiary) {
        toast.error("Please resolve all beneficiary ENS names or addresses")
        return
      }

      if (!formData.ownerAddress || !formData.ownerAddress.startsWith("0x")) {
        toast.error("Owner address must be valid")
        return
      }

      // Convert percentages to BPS for smart contract
      const beneficiaryAddresses = formData.beneficiaries.map((b) => b.resolvedAddress!)
      const beneficiaryShares = formData.beneficiaries.map((b) => {
        const percent = parseFloat(b.sharePercent || "0")
        return percentToBps(percent)
      })

      // Verify shares total to exactly 10000 BPS
      const totalBps = beneficiaryShares.reduce((sum, s) => sum + s, 0)
      if (totalBps !== 10000) {
        // Adjust last share to make it exactly 10000 (handle rounding errors)
        const difference = 10000 - totalBps
        beneficiaryShares[beneficiaryShares.length - 1] += difference
      }

      const toastId = toast.loading("Creating subdomain...")

      let hash
      try {
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
        toast.dismiss(toastId)
      } catch (txError: any) {
        toast.dismiss(toastId)
        throw txError
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
        ownerInput: address || "",
        ownerAddress: address || "",
        royaltyPercent: "10",
        beneficiaries: [{ input: address || "", resolvedAddress: address || null, sharePercent: "100", isResolving: false, isResolved: true }],
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
          Enter share percentages (0-100%). Total must equal 100%. You can use ENS names or addresses for beneficiaries.
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
              <label className="block text-sm font-medium mb-2">Owner Address or ENS *</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="0x... or vitalik.eth"
                  value={formData.ownerInput}
                  onChange={(e) => setFormData({ ...formData, ownerInput: e.target.value })}
                  className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
                />
                {isResolvingOwner && (
                  <p className="text-xs text-blue-500">🔄 Resolving ENS name...</p>
                )}
                {formData.ownerAddress && formData.ownerAddress !== formData.ownerInput && (
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved to: {formData.ownerAddress.slice(0, 10)}...{formData.ownerAddress.slice(-8)}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Who will own this subdomain (defaults to your address)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Parent Royalty % *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="10"
                value={formData.royaltyPercent}
                onChange={(e) => setFormData({ ...formData, royaltyPercent: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Percentage of revenue sent to parent domain owner (in basis points: 1% = 100 BPS)
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Beneficiaries & Revenue Split</h2>
            <p className="text-sm text-muted-foreground">Enter percentage shares (must total 100%)</p>

            <div className="space-y-3">
              {formData.beneficiaries.map((beneficiary, idx) => (
                <div key={idx} className="space-y-2 pb-3 border-b border-border">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">ENS Name or Address</label>
                      <input
                        type="text"
                        placeholder="vitalik.eth or 0x..."
                        value={beneficiary.input}
                        onChange={(e) => updateBeneficiary(idx, "input", e.target.value)}
                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Share (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="50"
                        value={beneficiary.sharePercent}
                        onChange={(e) => updateBeneficiary(idx, "sharePercent", e.target.value)}
                        className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none transition"
                      />
                    </div>
                    {!beneficiary.isResolved && beneficiary.input && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => resolveBeneficiaryENS(idx)}
                        disabled={beneficiary.isResolving}
                        className="whitespace-nowrap"
                      >
                        {beneficiary.isResolving ? "..." : "Resolve"}
                      </Button>
                    )}
                    {formData.beneficiaries.length > 1 && (
                      <button
                        onClick={() => removeBeneficiary(idx)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    )}
                  </div>
                  
                  {beneficiary.isResolved && beneficiary.resolvedAddress && (
                    <div className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle2 className="h-3 w-3" />
                      <span className="font-mono">{beneficiary.resolvedAddress.slice(0, 10)}...{beneficiary.resolvedAddress.slice(-8)}</span>
                    </div>
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

            <div className={`border rounded-lg p-4 ${
              totalPercent === 100 ? "bg-primary/5 border-primary/30" : "bg-destructive/5 border-destructive/30"
            }`}>
              <p className="text-sm font-medium mb-2">
                Total: {totalPercent.toFixed(2)}%
              </p>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    totalPercent === 100 ? "bg-gradient-to-r from-primary to-accent" : "bg-destructive"
                  }`}
                  style={{ width: `${Math.min(totalPercent, 100)}%` }}
                />
              </div>
              {totalPercent !== 100 && (
                <p className="text-xs text-destructive mt-2">
                  {totalPercent < 100 ? `Missing ${(100 - totalPercent).toFixed(2)}%` : `Over by ${(totalPercent - 100).toFixed(2)}%`}
                </p>
              )}
              <div className="mt-3 space-y-1">
                {formData.beneficiaries.map((b, i) => (
                  <div key={i} className="text-xs flex justify-between">
                    <span>{b.input || `Beneficiary ${i + 1}`}</span>
                    <span className="font-semibold">{b.sharePercent}%</span>
                  </div>
                ))}
              </div>
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
              {formData.beneficiaries.map((b, idx) => {
                const percent = parseFloat(b.sharePercent || "0")
                return (
                  <div key={idx} className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{b.input || `Beneficiary ${idx + 1}`}</span>
                      <span className="font-semibold">{b.sharePercent}%</span>
                    </div>
                    {b.resolvedAddress && (
                      <p className="font-mono text-muted-foreground">{b.resolvedAddress.slice(0, 10)}...{b.resolvedAddress.slice(-8)}</p>
                    )}
                  </div>
                )
              })}
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
                (step === 2 && (Math.abs(totalPercent - 100) > 0.01 || formData.beneficiaries.some(b => !b.isResolved)))
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
