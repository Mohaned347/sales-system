"use client"


import { AppProvider } from '@/context/app-context'
import DashboardLayoutInner from '@/components/the-mainsystem/LayoutInner'

export default function DashboardLayout({ children }) {
  return (
    <AppProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AppProvider>
  )
}
