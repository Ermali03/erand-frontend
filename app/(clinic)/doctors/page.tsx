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
const ROLE_LABELS: Record<DoctorRole, string> = {
  Admin: "Admin",
  "Main Surgeon": "Kirurgu kryesor",
  Doctor: "Mjek",
  Nurse: "Infermier/e",
};

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
          <span className="font-medium">{ROLE_LABELS[role]}</span>
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
      setError(e instanceof Error ? e.message : "Marrja e përdoruesve dështoi");
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
      setError("Plotësoni të gjitha fushat e profilit dhe hyrjes para krijimit të stafit.");
      return;
    }
    if (formData.roles.length === 0) {
      setError("Zgjidhni të paktën një rol.");
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
        `U krijua ${created.name} me rolet: ${created.roles.join(", ")}.`,
      );
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Krijimi i llogarisë së stafit dështoi",
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
      setError("Emri, specializimi, email-i dhe të paktën një rol janë të detyrueshme.");
      return;
    }
    if (editForm.roles.length === 0) {
      setError("Zgjidhni të paktën një rol.");
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
      setSuccess(`U përditësua ${editForm.name}.`);
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Përditësimi i llogarisë së stafit dështoi",
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
      setSuccess(`U fshi ${deleteTarget.email}.`);
      await Promise.all([loadUsers(), refreshDoctors()]);
    } catch (e) {
      setError(
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
          Krijoni llogari hyrëse për stafin, caktoni leje të shumta me kutiza zgjedhjeje, modifikoni profilin dhe fshini llogaritë kur nuk nevojiten më.
        </p>
      </div>

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
          <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
            Vetëm Admin
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Veprimi dështoi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="border-success/20 bg-success/5 text-success">
              <AlertTitle>U përfundua</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staffName">Emri i plotë</Label>
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
              <Label htmlFor="staffSpecialty">Specializimi / Reparti</Label>
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
              <Label htmlFor="staffEmail">Email-i për hyrje</Label>
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
              <Label htmlFor="staffPassword">Fjalëkalimi i përkohshëm</Label>
              <Input
                id="staffPassword"
                type="password"
                placeholder="Minimumi 10 karaktere"
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
            <Label>Lejet</Label>
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
              {submitting ? "Duke ruajtur..." : "Krijo hyrje për stafin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Llogaritë ekzistuese të stafit</CardTitle>
          <CardDescription>
            Modifikoni të dhënat e hyrjes, rregulloni lejet me kutiza ose fshini përdoruesin nga fundi i rreshtit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Duke ngarkuar përdoruesit...</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anëtari i stafit</TableHead>
                    <TableHead>Hyrja</TableHead>
                    <TableHead>Lejet</TableHead>
                    <TableHead>Statusi</TableHead>
                    <TableHead className="w-[180px] text-right">Veprimet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{user.name || "Profil stafi i palidhur"}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.specialty || "Pa specializim"}{" "}
                            {user.doctor_id ? `• ${user.doctor_id}` : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            USR-{user.id.toString().padStart(4, "0")}
                            {user.id === currentUserId ? " • Ju" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <Badge key={`${user.id}-${role}`} variant="secondary">
                              {ROLE_LABELS[role]}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-success/20 bg-success/5 text-success"
                        >
                          Aktiv
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
                            Ndrysho
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(user)}
                            disabled={user.id === currentUserId}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Fshi
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
            <DialogTitle>Ndrysho llogarinë e stafit</DialogTitle>
            <DialogDescription>
              Përditësoni profilin, email-in e hyrjes, fjalëkalimin dhe lejet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="editName">Emri i plotë</Label>
              <Input
                id="editName"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((current) => ({ ...current, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSpecialty">Specializimi</Label>
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
              <Label htmlFor="editEmail">Email-i për hyrje</Label>
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
              <Label htmlFor="editPassword">Fjalëkalimi i ri</Label>
              <Input
                id="editPassword"
                type="password"
                placeholder="Lëreni bosh për të mbajtur fjalëkalimin aktual"
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
            <Label>Lejet</Label>
            <RoleCheckboxGroup
              selectedRoles={editForm.roles}
              onChange={(roles) =>
                setEditForm((current) => ({ ...current, roles }))
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Anulo
            </Button>
            <Button onClick={handleEditStaff} disabled={submitting}>
              Ruaj ndryshimet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fshi llogarinë e stafit</DialogTitle>
            <DialogDescription>
              Kjo do të fshijë llogarinë e hyrjes dhe profilin e lidhur të mjekut për {deleteTarget?.email}. Ky veprim nuk mund të kthehet prapa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Anulo
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStaff}
              disabled={submitting}
            >
              Fshi përdoruesin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
