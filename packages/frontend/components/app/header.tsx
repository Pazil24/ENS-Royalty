"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function AppHeader() {
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
        <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">Connect Wallet</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      </div>
    </header>
  )
}
