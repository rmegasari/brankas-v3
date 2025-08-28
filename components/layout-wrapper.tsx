"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { accounts as initialAccounts } from "@/lib/data"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        accounts={initialAccounts}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-0" : "ml-0"}`}>{children}</main>
    </div>
  )
}
