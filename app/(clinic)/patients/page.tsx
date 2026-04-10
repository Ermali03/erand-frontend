"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useClinic } from "@/lib/clinic-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Pencil, Plus, Printer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface PatientRecord {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  status: string;
  is_operated: boolean;
}

export default function PatientsDashboardPage() {
  const router = useRouter();
  const { token, hasPermission, startNewPatient, loadPatientIntoWorkflow } =
    useClinic();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    try {
      if (!token) return;
      const data = await apiRequest<PatientRecord[]>("/patients", { token });
      setPatients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Marrja e pacientëve dështoi");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const handleUpdatePatient = async (
    patientId: string,
    updates: Partial<PatientRecord>,
  ) => {
    try {
      if (!token) return;
      await apiRequest(`/patients/${patientId}`, {
        method: "PUT",
        token,
        body: updates,
      });
      setPatients((currentPatients) =>
        currentPatients.map((p) =>
          p.id === patientId ? { ...p, ...updates } : p,
        ),
      );
    } catch (e) {
      console.error("Përditësimi i pacientit dështoi", e);
    }
  };

  const handleEditPatient = async (patientId: string) => {
    setEditingPatientId(patientId);
    setError("");

    try {
      await loadPatientIntoWorkflow(patientId);
      router.push("/anamnesis");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hapja e formularit të pacientit dështoi");
    } finally {
      setEditingPatientId(null);
    }
  };

  if (!hasPermission("view")) {
    return (
      <div className="p-6 text-muted-foreground">
        Nuk keni leje për të parë kartelat e pacientëve.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Të gjithë pacientët</h1>
          <p className="text-sm text-muted-foreground">
            Pasqyrë e të gjitha kartelave aktive dhe historike të pacientëve.
          </p>
        </div>
        {hasPermission("edit") && (
          <Button
            onClick={() => {
              startNewPatient();
              router.push("/anamnesis");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Pacient i ri
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjithsej kartela</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft / Aktive</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                patients.filter(
                  (p) =>
                    p.status === "draft" ||
                    p.status === "admitted" ||
                    p.status === "in-treatment" ||
                    p.status === "operated",
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Të lëshuar</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter((p) => p.status === "discharged").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <p>Duke ngarkuar kartelat e pacientëve...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID e pacientit</TableHead>
                <TableHead>Emri</TableHead>
                <TableHead className="w-[180px]">Operacioni</TableHead>
                <TableHead className="w-[180px]">Statusi</TableHead>
                <TableHead className="text-right">Veprimet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => router.push(`/patients/${p.id}`)}
                >
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {p.id}
                  </TableCell>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      defaultValue={p.is_operated.toString()}
                      onValueChange={(val) =>
                        handleUpdatePatient(p.id, {
                          is_operated: val === "true",
                        })
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">I operuar</SelectItem>
                        <SelectItem value="false">Jo</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      defaultValue={p.status}
                      onValueChange={(val) =>
                        handleUpdatePatient(p.id, { status: val })
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="admitted">I pranuar</SelectItem>
                        <SelectItem value="in-treatment">
                          Në trajtim
                        </SelectItem>
                        <SelectItem value="operated">I operuar</SelectItem>
                        <SelectItem value="discharged">I lëshuar</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ndrysho ${p.full_name}`}
                        disabled={editingPatientId === p.id}
                        onClick={() => void handleEditPatient(p.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Printo ${p.full_name}`}
                        onClick={() =>
                          window.open(`/patients/${p.id}?print=1`, "_blank")
                        }
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nuk u gjet asnjë pacient.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
