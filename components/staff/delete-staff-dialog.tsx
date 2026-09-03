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
import type { StaffUser } from "@/lib/staff";

interface DeleteStaffDialogProps {
  target: StaffUser | null;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteStaffDialog({
  target,
  submitting,
  onConfirm,
  onClose,
}: DeleteStaffDialogProps) {
  return (
    <Dialog open={Boolean(target)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fshi llogarinë e stafit</DialogTitle>
          <DialogDescription>
            Kjo do të fshijë llogarinë e hyrjes dhe profilin e lidhur të mjekut
            për {target?.email}. Ky veprim nuk mund të kthehet prapa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anulo
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting}
          >
            Fshi përdoruesin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
