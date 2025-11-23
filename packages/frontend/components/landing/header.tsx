"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-4 left-0 right-0 mx-auto w-[95%] max-w-6xl z-50 transition-all duration-300 rounded-full border ${
        isScrolled
          ? "bg-background/70 backdrop-blur-xl border-white/10 shadow-lg"
          : "bg-background/30 backdrop-blur-md border-white/5"
      }`}
    >
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="ENS Royalty" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">ENS Royalty</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">
            How It Works
          </Link>
          <Link href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition">
            Use Cases
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/app">
            <Button size="sm" variant="default" className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">
              Launch App
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
