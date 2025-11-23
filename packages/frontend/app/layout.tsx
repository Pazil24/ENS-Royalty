import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { headers } from 'next/headers'
import AppKitProvider from '@/lib/context/appkit-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "ENS Royalty System | Programmable Revenue Streams",
  description: "Create programmable revenue streams with immutable commission splits on ENS.",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en" className={inter.className}>
      <body>
        <AppKitProvider cookies={cookies}>
          <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
            {children}
          </div>

          <Toaster position="bottom-right" richColors />

          {/* Vercel Speed Insights and Analytics components */}
          <SpeedInsights />
          <Analytics />
        </AppKitProvider>
      </body>
    </html>
  )
}
