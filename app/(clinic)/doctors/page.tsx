"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useClinic } from "@/lib/clinic-context";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pencil, ShieldPlus, Trash2, UserRoundPlus } from "lucide-react";
import type { DoctorRole } from "@/lib/types";

interface StaffUser {
  id: number;
  email: string;
  role: DoctorRole;
  roles: DoctorRole[];
  doctor_id: string | null;
  name: string | null;
  specialty: string | null;
}

interface StaffAccountResponse {
  user_id: number;
  doctor_id: string;
  name: string;
  specialty: string;
  email: string;
  role: DoctorRole;
  roles: DoctorRole[];
}

interface StaffFormState {
  name: string;
  specialty: string;
  email: string;
  password: string;
  roles: DoctorRole[];
}

const ROLE_OPTIONS: DoctorRole[] = ["Admin", "Main Surgeon", "Doctor", "Nurse"];

const EMPTY_FORM: StaffFormState = {
  name: "",
  specialty: "",
  email: "",
  password: "",
  roles: ["Doctor"],
};

function toggleRoleInList(roles: DoctorRole[], role: DoctorRole): DoctorRole[] {
  if (roles.includes(role)) {
    return roles.filter((item) => item !== role);
  }
  return [...roles, role];
}

function RoleCheckboxGroup({
  selectedRoles,
  onChange,
}: {
  selectedRoles: DoctorRole[];
  onChange: (roles: DoctorRole[]) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLE_OPTIONS.map((role) => (
        <label
          key={role}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"
        >
          <Checkbox
            checked={selectedRoles.includes(role)}
            onCheckedChange={() => onChange(toggleRoleInList(selectedRoles, role))}
          />
          <span className="font-medium">{role}</span>
        </label>
      ))}
    </div>
  );
}

export default function DoctorsAdminPage() {
  const { authUser, token, hasPermission, refreshDoctors } = useClinic();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<StaffFormState>(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState<StaffFormState>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  const currentUserId = authUser?.id ?? null;

  const loadUsers = useCallback(async () => {
    try {
      if (!token) return;
      setError("");
      const data = await apiRequest<StaffUser[]>("/users", { token });
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch users");
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
      setError("Complete all profile and login fields before creating staff.");
      return;
    }
    if (formData.roles.length === 0) {
      setError("Select at least one role.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const created = await apiRequest<StaffAccountResponse>("/users/staff", {
        method: "POST",
        token,
        body: formData,
      });
      setFormData(EMPTY_FORM);
      setSuccess(
        `Created ${created.name} with roles: ${created.roles.join(", ")}.`,
      );
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to create staff account",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (user: StaffUser) => {
    setError("");
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
      setError("Name, specialty, email, and at least one role are required.");
      return;
    }
    if (editForm.roles.length === 0) {
      setError("Select at least one role.");
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
      setError("");
      setSuccess("");
      await apiRequest<StaffAccountResponse>(`/users/${editingUser.id}/staff`, {
        method: "PUT",
        token,
        body: payload,
      });
      setEditingUser(null);
      setSuccess(`Updated ${editForm.name}.`);
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to update staff account",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await apiRequest<void>(`/users/${deleteTarget.id}`, {
        method: "DELETE",
        token,
      });
      setDeleteTarget(null);
      setSuccess(`Deleted ${deleteTarget.email}.`);
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete staff account",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasPermission("manage-doctors")) {
    return (
      <div className="p-6 text-muted-foreground">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Staff Administration
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Create staff login accounts, assign multiple permissions with
          checkboxes, edit profile details, and remove accounts when they are no
          longer needed.
        </p>
      </div>

      <Card className="border-primary/15 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldPlus className="h-5 w-5 text-primary" />
              Create Staff Account
            </CardTitle>
            <CardDescription>
              One action creates the login, doctor profile, and permission set.
            </CardDescription>
          </div>
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
            Admin Only
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Action failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="border-success/20 bg-success/5 text-success">
              <AlertTitle>Completed</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staffName">Full Name</Label>
              <Input
                id="staffName"
                placeholder="Dr. Elena Markovic"
                value={formData.name}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffSpecialty">Specialty / Department</Label>
              <Input
                id="staffSpecialty"
                placeholder="Orthopedic Surgery"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    specialty: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffEmail">Login Email</Label>
              <Input
                id="staffEmail"
                type="email"
                placeholder="elena@clinic.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((current) => ({ ...current, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staffPassword">Temporary Password</Label>
              <Input
                id="staffPassword"
                type="password"
                placeholder="Minimum 10 characters"
                value={formData.password}
                onChange={(e) =>
                  setFormData((current) => ({
                    ...current,
                    password: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <RoleCheckboxGroup
              selectedRoles={formData.roles}
              onChange={(roles) =>
                setFormData((current) => ({ ...current, roles }))
              }
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCreateStaff} disabled={submitting}>
              <UserRoundPlus className="mr-2 h-4 w-4" />
              {submitting ? "Saving..." : "Create Staff Login"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Staff Accounts</CardTitle>
          <CardDescription>
            Edit login details, adjust permissions with checkboxes, or delete a
            user from the end of the row.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{user.name || "Unlinked staff profile"}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.specialty || "No specialty"}{" "}
                            {user.doctor_id ? `• ${user.doctor_id}` : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            USR-{user.id.toString().padStart(4, "0")}
                            {user.id === currentUserId ? " • You" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <Badge key={`${user.id}-${role}`} variant="secondary">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-success/20 bg-success/5 text-success"
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(user)}
                            disabled={user.id === currentUserId}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Staff Account</DialogTitle>
            <DialogDescription>
              Update profile information, login email, password, and checkbox permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((current) => ({ ...current, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSpecialty">Specialty</Label>
              <Input
                id="editSpecialty"
                value={editForm.specialty}
                onChange={(e) =>
                  setEditForm((current) => ({
                    ...current,
                    specialty: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Login Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((current) => ({ ...current, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPassword">New Password</Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="Leave blank to keep current password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm((current) => ({
                    ...current,
                    password: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <RoleCheckboxGroup
              selectedRoles={editForm.roles}
              onChange={(roles) =>
                setEditForm((current) => ({ ...current, roles }))
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff} disabled={submitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff Account</DialogTitle>
            <DialogDescription>
              This will remove the login account and linked doctor profile for{" "}
              {deleteTarget?.email}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStaff}
              disabled={submitting}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
