"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldPlus, UserRoundPlus } from "lucide-react";
import type { StaffFormState } from "@/lib/staff";
import { RoleCheckboxGroup } from "./role-checkbox-group";
import { StaffFormFields } from "./staff-form-fields";

interface CreateStaffCardProps {
  form: StaffFormState;
  onChange: (patch: Partial<StaffFormState>) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function CreateStaffCard({
  form,
  onChange,
  onSubmit,
  submitting,
}: CreateStaffCardProps) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5 text-primary" />
            Krijo llogari të stafit
          </CardTitle>
          <CardDescription>
            Me një veprim krijohen hyrja, profili i mjekut dhe lejet.
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-primary/20 bg-primary/5 text-primary"
        >
          Vetëm Admin
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <StaffFormFields
          idPrefix="staff"
          form={form}
          onChange={onChange}
          passwordLabel="Fjalëkalimi i përkohshëm"
          passwordPlaceholder="Minimumi 10 karaktere"
        />

        <div className="space-y-3">
          <Label>Lejet</Label>
          <RoleCheckboxGroup
            selectedRoles={form.roles}
            onChange={(roles) => onChange({ roles })}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={submitting}>
            <UserRoundPlus className="mr-2 h-4 w-4" />
            {submitting ? "Duke ruajtur..." : "Krijo hyrje për stafin"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
