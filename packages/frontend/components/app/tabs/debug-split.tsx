"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useReadContract } from "wagmi"
import { namehash } from "viem"
import { CONTRACTS } from "@/lib/config/contracts"
import RoyaltyPaymentSplitterABI from "@/lib/abis/RoyaltyPaymentSplitter.json"

export function DebugSplit() {
  const [domain, setDomain] = useState("")
  const [beneficiaryIndex, setBeneficiaryIndex] = useState(0)
  
  const node = domain ? namehash(domain) : undefined
  
  // Read beneficiary at index
  const { data: beneficiary } = useReadContract({
    address: CONTRACTS.RoyaltyPaymentSplitter.address,
    abi: RoyaltyPaymentSplitterABI,
    functionName: 'beneficiaries',
    args: node ? [node, BigInt(beneficiaryIndex)] : undefined,
    query: {
      enabled: !!node,
    },
  })
  
  // Read share at index
  const { data: share } = useReadContract({
    address: CONTRACTS.RoyaltyPaymentSplitter.address,
    abi: RoyaltyPaymentSplitterABI,
    functionName: 'shares',
    args: node ? [node, BigInt(beneficiaryIndex)] : undefined,
    query: {
      enabled: !!node,
    },
  })

  const beneficiaryAddress = beneficiary as string | undefined
  const shareAmount = share as bigint | undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Debug Split Configuration</h1>
        <p className="text-muted-foreground">Check if beneficiaries and shares are set up correctly</p>
      </div>

      <Card className="glass-border p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="domain">Full Subdomain Name</Label>
            <Input
              id="domain"
              placeholder="shop.mybrand.eth"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>

          {domain && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Namehash:</p>
              <p className="font-mono text-xs break-all">{namehash(domain)}</p>
            </div>
          )}

          <div>
            <Label htmlFor="index">Beneficiary Index</Label>
            <Input
              id="index"
              type="number"
              min="0"
              value={beneficiaryIndex}
              onChange={(e) => setBeneficiaryIndex(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground mt-1">Try 0, 1, 2 to check each beneficiary</p>
          </div>

          {beneficiaryAddress && beneficiaryAddress !== "0x0000000000000000000000000000000000000000" && (
            <div className="border-t border-border pt-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Beneficiary Address:</p>
                <p className="font-mono text-sm">{beneficiaryAddress}</p>
              </div>
              
              {shareAmount && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Share (BPS):</p>
                  <p className="font-mono text-sm">
                    {shareAmount.toString()} BPS = {(Number(shareAmount) / 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {beneficiaryAddress === "0x0000000000000000000000000000000000000000" && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <p className="text-sm text-destructive font-semibold">⚠️ No beneficiary found at this index</p>
              <p className="text-xs text-muted-foreground mt-1">
                This means the split was not set up correctly, or this index doesn't exist.
              </p>
            </div>
          )}

          {!beneficiaryAddress && domain && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-amber-600 font-semibold">🔍 No data returned</p>
              <p className="text-xs text-muted-foreground mt-1">
                The contract might not have any beneficiaries configured for this subdomain.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="glass-border p-6 bg-primary/5">
        <h3 className="font-semibold mb-3">How to use:</h3>
        <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
          <li>Enter the full subdomain name (e.g., "shop.mybrand.eth")</li>
          <li>Start with index 0 to see the first beneficiary</li>
          <li>Increment the index to see other beneficiaries</li>
          <li>If you see address 0x0000... it means no beneficiary at that index</li>
          <li>Shares should add up to 10000 BPS (100%)</li>
        </ol>
      </Card>
    </div>
  )
}
