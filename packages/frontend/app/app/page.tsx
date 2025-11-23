"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app/layout"
import { Dashboard } from "@/components/app/tabs/dashboard"
import { CreateSubdomain } from "@/components/app/tabs/create-subdomain"
import { MySubdomains } from "@/components/app/tabs/my-subdomains"
import { PaymentsWithdrawals } from "@/components/app/tabs/payments-withdrawals"

type TabType = "dashboard" | "create" | "my-subdomains" | "payments" | "settings"

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "create":
        return <CreateSubdomain />
      case "my-subdomains":
        return <MySubdomains />
      case "payments":
        return <PaymentsWithdrawals />
      case "settings":
        return <div className="text-center py-12">Settings tab coming soon</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTab()}
    </AppLayout>
  )
}
