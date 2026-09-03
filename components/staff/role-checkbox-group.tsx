"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { DoctorRole } from "@/lib/types";
import { ROLE_LABELS, ROLE_OPTIONS, toggleRoleInList } from "@/lib/staff";

interface RoleCheckboxGroupProps {
  selectedRoles: DoctorRole[];
  onChange: (roles: DoctorRole[]) => void;
}

export function RoleCheckboxGroup({
  selectedRoles,
  onChange,
}: RoleCheckboxGroupProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLE_OPTIONS.map((role) => (
        <label
          key={role}
          className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3 text-sm"
        >
          <Checkbox
            checked={selectedRoles.includes(role)}
            onCheckedChange={() => onChange(toggleRoleInList(selectedRoles, role))}
          />
          <span className="font-medium">{ROLE_LABELS[role]}</span>
        </label>
      ))}
    </div>
  );
}
