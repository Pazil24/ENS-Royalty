"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useEnsName, useDisconnect } from 'wagmi'
import { mainnet } from 'viem/chains'

export function AppHeader() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  })

  const formatAddress = (addr: string) => {
    if (addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const displayName = ensName || (address ? formatAddress(address) : null)

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
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <Button
              onClick={() => open()}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              <span className="hidden sm:inline">{displayName}</span>
              <span className="sm:hidden">{displayName}</span>
            </Button>
          ) : (
            <Button
              onClick={() => open()}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
