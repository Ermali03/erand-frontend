"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useClinic } from "@/lib/clinic-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Activity,
  Scissors,
  ClipboardList,
} from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";

interface PatientFullData {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  status: string;
  is_operated: boolean;
  anamnesis: {
    chief_complaint: string;
    medical_history: string;
  } | null;
  epicrisis: {
    diagnosis: string;
    treatment_plan: string;
  } | null;
  surgery: {
    procedure_name: string;
    date: string;
    notes: string;
    surgeon_id: string;
  } | null;
  discharge_report: {
    discharge_date: string;
    instructions: string;
  } | null;
}

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, hasPermission } = useClinic();
  const [patient, setPatient] = useState<PatientFullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasPrintedRef = useRef(false);

  const patientId = params.id as string;

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (!token) return;
        const data = await apiRequest<PatientFullData>(
          `/patients/${patientId}/full`,
          { token },
        );
        setPatient(data);
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 404) {
          setError("Pacienti nuk u gjet");
        } else {
          setError(
            e instanceof Error ? e.message : "Marrja e të dhënave të pacientit dështoi",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, token]);

  useEffect(() => {
    if (loading || !patient || hasPrintedRef.current) return;
    if (searchParams.get("print") !== "1") return;
    hasPrintedRef.current = true;
    window.print();
  }, [loading, patient, searchParams]);

  if (!hasPermission("view")) {
    return (
      <div className="p-6 text-muted-foreground">
        Nuk keni leje për të parë kartelat e pacientëve.
      </div>
    );
  }

  if (loading) return <div className="p-6">Duke ngarkuar të dhënat e pacientit...</div>;
  if (error) return <div className="p-6 text-destructive">{error}</div>;
  if (!patient) return <div className="p-6">Nuk ka të dhëna për pacientin.</div>;

  const dob = patient.date_of_birth
    ? new Date(patient.date_of_birth).toLocaleDateString()
    : "E panjohur";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/patients")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kartela e pacientit: {patient.full_name}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="font-mono">ID: {patient.id}</span>
            <span>•</span>
            <span>Datëlindja: {dob}</span>
            <span>•</span>
            <Badge
              variant="outline"
              className={
                patient.status === "discharged"
                  ? "bg-success/10 text-success border-success/20"
                  : patient.status === "draft"
                    ? "bg-muted text-muted-foreground border-border"
                  : patient.status === "admitted"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-warning/10 text-warning border-warning/20"
              }
            >
              {patient.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Anamnesis */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Anamneza</CardTitle>
              <CardDescription>Detajet fillestare të pranimit</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {patient.anamnesis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Ankesa kryesore
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.anamnesis.chief_complaint}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Historia mjekësore
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.anamnesis.medical_history}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nuk u gjet anamnezë e regjistruar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Epicrisis */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Epikriza</CardTitle>
              <CardDescription>Vlerësimi klinik dhe plani</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {patient.epicrisis ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Diagnoza
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.epicrisis.diagnosis}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Plani i trajtimit
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.epicrisis.treatment_plan}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nuk u gjet epikrizë e regjistruar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Surgery */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Scissors className="h-5 w-5 text-info" />
            </div>
            <div>
              <CardTitle>Raporti i operacionit</CardTitle>
              <CardDescription>
                Detajet e operacionit (nëse ka)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {patient.surgery ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Procedura
                    </h4>
                    <p className="text-sm font-medium">
                      {patient.surgery.procedure_name}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                      Data
                    </h4>
                    <p className="text-sm">
                      {new Date(patient.surgery.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    ID e kirurgut
                  </h4>
                  <p className="text-sm">{patient.surgery.surgeon_id}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Shënime operative
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.surgery.notes}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nuk u gjet raport operacioni.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Discharge */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Activity className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle>Shënimet e lëshimit</CardTitle>
              <CardDescription>Udhëzimet finale dhe statusi</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {patient.discharge_report ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Data e lëshimit
                  </h4>
                  <p className="text-sm">
                    {new Date(
                      patient.discharge_report.discharge_date,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Udhëzimet dhe terapia
                  </h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.discharge_report.instructions}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nuk u gjet raport lëshimi (pacienti është aktualisht në pranim ose në trajtim).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
