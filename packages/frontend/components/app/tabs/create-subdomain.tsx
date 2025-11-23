"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"

export function CreateSubdomain() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    parentDomain: "",
    subdomainLabel: "",
    beneficiaries: [{ address: "", percentage: 0 }],
    lockSupply: false,
    burnFuses: false,
  })

  const addBeneficiary = () => {
    setFormData({
      ...formData,
      beneficiaries: [...formData.beneficiaries, { address: "", percentage: 0 }],
    })
  }

  const removeBeneficiary = (idx: number) => {
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

  const totalPercentage = formData.beneficiaries.reduce((sum, b) => sum + (b.percentage || 0), 0)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Subdomain</h1>
        <p className="text-muted-foreground">Set up a new revenue stream with royalty splits</p>
      </div>

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
              <label className="block text-sm font-medium mb-2">Parent Domain</label>
              <select
                value={formData.parentDomain}
                onChange={(e) => setFormData({ ...formData, parentDomain: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none transition"
              >
                <option value="">Select a domain...</option>
                <option value="mybrand.eth">mybrand.eth</option>
                <option value="creator.eth">creator.eth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subdomain Label</label>
              <input
                type="text"
                placeholder="e.g., vip"
                value={formData.subdomainLabel}
                onChange={(e) => setFormData({ ...formData, subdomainLabel: e.target.value })}
                className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition"
              />
              {formData.parentDomain && formData.subdomainLabel && (
                <p className="text-sm text-primary mt-2 font-mono">
                  {formData.subdomainLabel}.{formData.parentDomain}
                </p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Beneficiaries & Royalty Split</h2>

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
                  <div className="w-24">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Share %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={beneficiary.percentage}
                      onChange={(e) => updateBeneficiary(idx, "percentage", Number.parseInt(e.target.value) || 0)}
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

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Total: {totalPercentage}%</p>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${totalPercentage}%` }}
                />
              </div>
              {totalPercentage !== 100 && <p className="text-xs text-primary mt-2">Total must equal 100%</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Security Options</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.lockSupply}
                  onChange={(e) => setFormData({ ...formData, lockSupply: e.target.checked })}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-sm">Lock Royalty Supply</p>
                  <p className="text-xs text-muted-foreground">Prevent future token minting</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.burnFuses}
                  onChange={(e) => setFormData({ ...formData, burnFuses: e.target.checked })}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-sm">Burn Fuses</p>
                  <p className="text-xs text-muted-foreground">Make royalty terms immutable forever</p>
                </div>
              </label>
            </div>

            {formData.burnFuses && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm font-medium text-destructive">
                  Warning: Once locked, these settings CANNOT be changed
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
                <span className="text-muted-foreground">Beneficiaries:</span>
                <span className="font-semibold">{formData.beneficiaries.length}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-border">
                <span className="text-muted-foreground">Lock Supply:</span>
                <span className={formData.lockSupply ? "text-accent" : "text-muted-foreground"}>
                  {formData.lockSupply ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Burn Fuses:</span>
                <span className={formData.burnFuses ? "text-destructive" : "text-muted-foreground"}>
                  {formData.burnFuses ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-primary font-medium">Ready to deploy?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated gas cost: ~0.002 ETH (will be confirmed in wallet)
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
              disabled={
                (step === 1 && (!formData.parentDomain || !formData.subdomainLabel)) ||
                (step === 2 && totalPercentage !== 100)
              }
            >
              Next
            </Button>
          ) : (
            <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">Create Subdomain</Button>
          )}
        </div>
      </Card>
    </div>
  )
}
