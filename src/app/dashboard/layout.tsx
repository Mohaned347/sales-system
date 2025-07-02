import { AppProvider } from "@/context/app-context"
import { DashboardClientLayout } from '@/components/dashboard/client-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppProvider>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </AppProvider>
  )
}
