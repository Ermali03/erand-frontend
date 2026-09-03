"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import {
  SidebarMenuButton,
} from "@/components/ui/sidebar";

/**
 * Light/dark switch for the sidebar footer. Renders a stable placeholder until
 * mounted so the server and client markup match (next-themes needs the client).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <SidebarMenuButton
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full text-left"
      aria-label={isDark ? "Kalo në pamje të çelët" : "Kalo në pamje të errët"}
    >
      {mounted && isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span>{mounted && isDark ? "Pamje e çelët" : "Pamje e errët"}</span>
    </SidebarMenuButton>
  );
}
