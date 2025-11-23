"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Wallet, Loader2 } from "lucide-react"
import { useState } from "react"

export function AppHeader() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const connectWallet = async () => {
    if (isConnecting) return
    setIsConnecting(true)
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
        }
      } else {
        // Fallback for when no wallet is found or in preview environment
        console.warn("[v0] No wallet found. Simulating connection for demo.")
        // Simulate a delay and connection for the preview
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAddress("0x71C...976F")
      }
    } catch (error) {
      console.error("[v0] Failed to connect:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const formatAddress = (addr: string) => {
    if (addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="glass-border-subtle border-b">
      <div className="px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="ENS Royalty" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ENS Royalty System</h1>
            <p className="text-sm text-muted-foreground">Sepolia Testnet</p>
          </div>
        </div>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg flex items-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Connecting...</span>
            </>
          ) : address ? (
            <>
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              <span className="hidden sm:inline">{formatAddress(address)}</span>
              <span className="sm:hidden">{formatAddress(address)}</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
              <span className="sm:hidden">Connect</span>
            </>
          )}
        </Button>
      </div>
    </header>
  )
}
