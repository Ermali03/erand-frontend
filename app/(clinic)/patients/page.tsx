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
import { Activity, Pencil, Printer } from "lucide-react";
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
  const { token, hasPermission } = useClinic();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPatients = useCallback(async () => {
    try {
      if (!token) return;
      const data = await apiRequest<PatientRecord[]>("/patients", { token });
      setPatients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch patients");
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
      console.error("Failed to update patient", e);
    }
  };

  if (!hasPermission("view")) {
    return (
      <div className="p-6 text-muted-foreground">
        You do not have permission to view patient records.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Patients</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all active and historical patient records.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Admitted / In-Treatment
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                patients.filter(
                  (p) => p.status === "admitted" || p.status === "in-treatment",
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discharged</CardTitle>
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
        <p>Loading patient records...</p>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[180px]">Operations</TableHead>
                <TableHead className="w-[180px]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                        <SelectItem value="true">Operated</SelectItem>
                        <SelectItem value="false">None</SelectItem>
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
                        <SelectItem value="admitted">Admitted</SelectItem>
                        <SelectItem value="in-treatment">
                          In-Treatment
                        </SelectItem>
                        <SelectItem value="discharged">Discharged</SelectItem>
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
                        aria-label={`Edit ${p.full_name}`}
                        onClick={() => router.push(`/patients/${p.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Print ${p.full_name}`}
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
                    No patients found.
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
