"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { StaffFormState } from "@/lib/staff";
import { RoleCheckboxGroup } from "./role-checkbox-group";
import { StaffFormFields } from "./staff-form-fields";

interface EditStaffDialogProps {
  open: boolean;
  form: StaffFormState;
  submitting: boolean;
  onChange: (patch: Partial<StaffFormState>) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function EditStaffDialog({
  open,
  form,
  submitting,
  onChange,
  onSubmit,
  onClose,
}: EditStaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ndrysho llogarinë e stafit</DialogTitle>
          <DialogDescription>
            Përditësoni profilin, email-in e hyrjes, fjalëkalimin dhe lejet.
          </DialogDescription>
        </DialogHeader>

        <StaffFormFields
          idPrefix="edit"
          form={form}
          onChange={onChange}
          passwordLabel="Fjalëkalimi i ri"
          passwordPlaceholder="Lëreni bosh për të mbajtur fjalëkalimin aktual"
        />

        <div className="space-y-3">
          <Label>Lejet</Label>
          <RoleCheckboxGroup
            selectedRoles={form.roles}
            onChange={(roles) => onChange({ roles })}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulo
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            Ruaj ndryshimet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
