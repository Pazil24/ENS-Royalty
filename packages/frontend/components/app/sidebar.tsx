"use client"

import { type Dispatch, type SetStateAction, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, Plus, Gem, Wallet, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type TabType = "dashboard" | "create" | "my-subdomains" | "payments" | "settings"

interface AppSidebarProps {
  activeTab: TabType
  setActiveTab: Dispatch<SetStateAction<TabType>>
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "create", label: "Create Subdomain", icon: Plus },
  { id: "my-subdomains", label: "My Subdomains", icon: Gem },
  { id: "payments", label: "Payments & Withdrawals", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
]

export function AppSidebar({ activeTab, setActiveTab }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId)
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg glass-border-subtle md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 glass-border-enhanced border-r transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 pt-4">
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="ENS Royalty" fill className="object-contain" />
            </div>
            <span className="font-bold text-lg">Royalty</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
              Back to Landing
            </Button>
          </Link>
        </div>
      </aside>
    </>
  )
}
