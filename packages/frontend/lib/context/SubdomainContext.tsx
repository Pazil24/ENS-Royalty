"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Beneficiary {
  address: string
  share: string
  percentage: number
}

interface Subdomain {
  name: string
  fullName: string
  parentDomain: string
  owner: string
  isLocked: boolean
  beneficiaries: Beneficiary[]
  parentRoyalty: number
  availableBalance: string
  transactionHash?: string
  createdAt: Date
}

interface SubdomainContextType {
  subdomains: Subdomain[]
  addSubdomain: (subdomain: Subdomain) => void
  removeSubdomain: (fullName: string) => void
  updateSubdomain: (fullName: string, updates: Partial<Subdomain>) => void
  getSubdomainsByParent: (parentDomain: string) => Subdomain[]
}

const SubdomainContext = createContext<SubdomainContextType | undefined>(undefined)

export function SubdomainProvider({ children }: { children: React.ReactNode }) {
  const [subdomains, setSubdomains] = useState<Subdomain[]>([])

  const addSubdomain = useCallback((subdomain: Subdomain) => {
    setSubdomains(prev => {
      // Check if subdomain already exists
      const exists = prev.some(s => s.fullName === subdomain.fullName)
      if (exists) {
        // Update existing subdomain
        return prev.map(s => s.fullName === subdomain.fullName ? subdomain : s)
      }
      // Add new subdomain
      return [...prev, subdomain]
    })
  }, [])

  const removeSubdomain = useCallback((fullName: string) => {
    setSubdomains(prev => prev.filter(s => s.fullName !== fullName))
  }, [])

  const updateSubdomain = useCallback((fullName: string, updates: Partial<Subdomain>) => {
    setSubdomains(prev => prev.map(s => 
      s.fullName === fullName ? { ...s, ...updates } : s
    ))
  }, [])

  const getSubdomainsByParent = useCallback((parentDomain: string) => {
    return subdomains.filter(s => s.parentDomain === parentDomain)
  }, [subdomains])

  return (
    <SubdomainContext.Provider value={{
      subdomains,
      addSubdomain,
      removeSubdomain,
      updateSubdomain,
      getSubdomainsByParent
    }}>
      {children}
    </SubdomainContext.Provider>
  )
}

export function useSubdomains() {
  const context = useContext(SubdomainContext)
  if (context === undefined) {
    throw new Error('useSubdomains must be used within a SubdomainProvider')
  }
  return context
}
