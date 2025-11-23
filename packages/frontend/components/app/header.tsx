"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAppKit } from '@reown/appkit/react'
import { useAccount, useEnsName, useDisconnect } from 'wagmi'
import { mainnet, sepolia } from 'viem/chains'

export function AppHeader() {
  const { open } = useAppKit()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  
  // Try to get ENS name from Mainnet first
  const { data: mainnetEnsName } = useEnsName({
    address,
    chainId: mainnet.id,
  })
  
  // Try to get ENS name from Sepolia if on Sepolia
  const { data: sepoliaEnsName } = useEnsName({
    address,
    chainId: sepolia.id,
    query: {
      enabled: chain?.id === sepolia.id && !mainnetEnsName,
    }
  })

  const formatAddress = (addr: string) => {
    if (addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Priority: Mainnet ENS > Sepolia ENS > Formatted Address
  const displayName = mainnetEnsName || sepoliaEnsName || (address ? formatAddress(address) : null)

  return (
    <header className="glass-border-subtle border-b">
      <div className="px-6 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="ENS Royalty" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ENS Royalty System</h1>
            <p className="text-sm text-muted-foreground">
              {chain?.name || "Sepolia Testnet"}
            </p>
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
