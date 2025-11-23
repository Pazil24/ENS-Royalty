import type React from "react"
import type { Dispatch, SetStateAction } from "react"
import { AppSidebar } from "./sidebar"
import { AppHeader } from "./header"

type TabType = "dashboard" | "create" | "my-subdomains" | "payments" | "settings"

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: TabType
  setActiveTab: Dispatch<SetStateAction<TabType>>
}

const AppLayout = ({ children, activeTab, setActiveTab }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}

export { AppLayout }
export default AppLayout
