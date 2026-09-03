"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useClinic } from "@/lib/clinic-context";
import { apiRequest } from "@/lib/api";
import type { DoctorRole } from "@/lib/types";
import {
  EMPTY_STAFF_FORM,
  type StaffAccountResponse,
  type StaffFormState,
  type StaffUser,
} from "@/lib/staff";
import { CreateStaffCard } from "@/components/staff/create-staff-card";
import { StaffTable } from "@/components/staff/staff-table";
import { EditStaffDialog } from "@/components/staff/edit-staff-dialog";
import { DeleteStaffDialog } from "@/components/staff/delete-staff-dialog";

export default function DoctorsAdminPage() {
  const { authUser, token, hasPermission, refreshDoctors } = useClinic();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState<StaffFormState>(EMPTY_STAFF_FORM);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  const currentUserId = authUser?.id ?? null;

  const loadUsers = useCallback(async () => {
    try {
      if (!token) return;
      const data = await apiRequest<StaffUser[]>("/users", { token });
      setUsers(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Marrja e përdoruesve dështoi");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.id === currentUserId) return -1;
        if (b.id === currentUserId) return 1;
        return a.email.localeCompare(b.email);
      }),
    [currentUserId, users],
  );

  const handleCreateStaff = async () => {
    if (
      !formData.name ||
      !formData.specialty ||
      !formData.email ||
      !formData.password
    ) {
      toast.error(
        "Plotësoni të gjitha fushat e profilit dhe hyrjes para krijimit të stafit.",
      );
      return;
    }
    if (formData.roles.length === 0) {
      toast.error("Zgjidhni të paktën një rol.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await apiRequest<StaffAccountResponse>("/users/staff", {
        method: "POST",
        token,
        body: formData,
      });
      setFormData(EMPTY_STAFF_FORM);
      toast.success(
        `U krijua ${created.name} me rolet: ${created.roles.join(", ")}.`,
      );
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Krijimi i llogarisë së stafit dështoi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (user: StaffUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name ?? "",
      specialty: user.specialty ?? "",
      email: user.email,
      password: "",
      roles: user.roles,
    });
  };

  const handleEditStaff = async () => {
    if (!editingUser) return;
    if (!editForm.name || !editForm.specialty || !editForm.email) {
      toast.error(
        "Emri, specializimi, email-i dhe të paktën një rol janë të detyrueshme.",
      );
      return;
    }
    if (editForm.roles.length === 0) {
      toast.error("Zgjidhni të paktën një rol.");
      return;
    }

    const payload: Record<string, string | DoctorRole[]> = {
      name: editForm.name,
      specialty: editForm.specialty,
      email: editForm.email,
      roles: editForm.roles,
    };
    if (editForm.password) {
      payload.password = editForm.password;
    }

    try {
      setSubmitting(true);
      await apiRequest<StaffAccountResponse>(`/users/${editingUser.id}/staff`, {
        method: "PUT",
        token,
        body: payload,
      });
      setEditingUser(null);
      toast.success(`U përditësua ${editForm.name}.`);
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Përditësimi i llogarisë së stafit dështoi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      await apiRequest<void>(`/users/${deleteTarget.id}`, {
        method: "DELETE",
        token,
      });
      const deletedEmail = deleteTarget.email;
      setDeleteTarget(null);
      toast.success(`U fshi ${deletedEmail}.`);
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Fshirja e llogarisë së stafit dështoi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission("manage-doctors")) {
    return (
      <div className="p-6 text-muted-foreground">
        Nuk keni leje për të parë këtë faqe.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Administrimi i stafit
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Krijoni llogari hyrëse për stafin, caktoni leje të shumta me kutiza
          zgjedhjeje, modifikoni profilin dhe fshini llogaritë kur nuk nevojiten
          më.
        </p>
      </div>

      <CreateStaffCard
        form={formData}
        onChange={(patch) => setFormData((current) => ({ ...current, ...patch }))}
        onSubmit={handleCreateStaff}
        submitting={submitting}
      />

      <StaffTable
        users={sortedUsers}
        currentUserId={currentUserId}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={setDeleteTarget}
      />

      <EditStaffDialog
        open={Boolean(editingUser)}
        form={editForm}
        submitting={submitting}
        onChange={(patch) => setEditForm((current) => ({ ...current, ...patch }))}
        onSubmit={handleEditStaff}
        onClose={() => setEditingUser(null)}
      />

      <DeleteStaffDialog
        target={deleteTarget}
        submitting={submitting}
        onConfirm={handleDeleteStaff}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
