"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StaffFormState } from "@/lib/staff";

interface StaffFormFieldsProps {
  /** Prefix for input ids so the create form and edit dialog don't collide. */
  idPrefix: string;
  form: StaffFormState;
  onChange: (patch: Partial<StaffFormState>) => void;
  passwordLabel: string;
  passwordPlaceholder: string;
}

/** The name / specialty / email / password grid shared by create and edit. */
export function StaffFormFields({
  idPrefix,
  form,
  onChange,
  passwordLabel,
  passwordPlaceholder,
}: StaffFormFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}Name`}>Emri i plotë</Label>
        <Input
          id={`${idPrefix}Name`}
          placeholder="Dr. Elena Markovic"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}Specialty`}>Specializimi / Reparti</Label>
        <Input
          id={`${idPrefix}Specialty`}
          placeholder="Orthopedic Surgery"
          value={form.specialty}
          onChange={(e) => onChange({ specialty: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}Email`}>Email-i për hyrje</Label>
        <Input
          id={`${idPrefix}Email`}
          type="email"
          placeholder="elena@clinic.com"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}Password`}>{passwordLabel}</Label>
        <Input
          id={`${idPrefix}Password`}
          type="password"
          placeholder={passwordPlaceholder}
          value={form.password}
          onChange={(e) => onChange({ password: e.target.value })}
        />
      </div>
    </div>
  );
}
