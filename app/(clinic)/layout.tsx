import type React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PatientHeader } from "@/components/patient-header"
import { ClinicProvider } from "@/lib/clinic-context"

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClinicProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PatientHeader />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ClinicProvider>
  )
}
