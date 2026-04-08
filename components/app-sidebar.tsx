"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  FileText,
  Scissors,
  FileOutput,
  Users,
  UserSquare2,
  Activity,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useClinic } from "@/lib/clinic-context";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "All Patients",
    href: "/patients",
    icon: UserSquare2,
    requiresAdmission: false,
    requiresSurgery: false,
  },
  {
    title: "Anamnesis",
    href: "/anamnesis",
    icon: ClipboardList,
    requiresAdmission: false,
    requiresSurgery: false,
  },
  {
    title: "Epicrisis",
    href: "/epicrisis",
    icon: FileText,
    requiresAdmission: true,
    requiresSurgery: false,
  },
  {
    title: "Surgery",
    href: "/surgery",
    icon: Scissors,
    requiresAdmission: true,
    requiresSurgery: true,
  },
  {
    title: "Discharge",
    href: "/discharge",
    icon: FileOutput,
    requiresAdmission: true,
    requiresSurgery: false,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isPatientAdmitted, patient, hasPermission, logout } = useClinic();

  const isNavItemEnabled = (item: (typeof navItems)[number]) => {
    if (!item.requiresAdmission) return true;
    if (!isPatientAdmitted) return false;
    if (item.requiresSurgery && !patient.isOperated) return false;
    return true;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              Ortopedia
            </h1>
            <p className="text-xs text-sidebar-foreground/60">
              Clinical Operations
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Patient Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isEnabled = isNavItemEnabled(item);
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        !isEnabled && "opacity-40 pointer-events-none",
                      )}
                    >
                      <Link href={isEnabled ? item.href : "#"}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {hasPermission("manage-doctors") && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/doctors"}>
                    <Link href="/doctors">
                      <Users className="h-4 w-4" />
                      <span>Doctors</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="w-full text-left"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
