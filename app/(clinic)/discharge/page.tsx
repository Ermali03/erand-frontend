"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useClinic } from "@/lib/clinic-context";
import {
  AnamnesisSummary,
  EpicrisisSummary,
  SurgerySummary,
} from "@/components/discharge/summary-section";
import { AlertCircle, Printer, Lock, CheckCircle } from "lucide-react";

function formatDate(value: string | null | undefined) {
  if (!value) return "____________";
  return new Date(value).toLocaleDateString("sq-AL");
}

function splitLines(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function DischargePage() {
  const router = useRouter();
  const {
    isPatientAdmitted,
    patient,
    epicrisis,
    surgery,
    currentDoctor,
    dischargeReport,
    updateDischargeReport,
    dischargePatient,
    saveEpicrisisRecord,
    saveSurgeryRecord,
    saveDischargeRecord,
    hasPermission,
    resetAll,
  } = useClinic();

  const canEdit = hasPermission("discharge");

  const handlePrint = () => {
    window.print();
  };

  const handleDischarge = async () => {
    if (
      !dischargeReport.finalDiagnosis ||
      !dischargeReport.therapyForHome ||
      !dischargeReport.followUpInstructions
    ) {
      return;
    }
    await saveEpicrisisRecord();
    await saveSurgeryRecord();
    await saveDischargeRecord();
    dischargePatient();
  };

  const handleDischargeAndReset = async () => {
    await handleDischarge();
    resetAll();
    router.push("/anamnesis");
  };

  const isFormComplete =
    dischargeReport.finalDiagnosis &&
    dischargeReport.therapyForHome &&
    dischargeReport.followUpInstructions;

  const dischargeDateLabel = new Date(
    dischargeReport.dischargeDate || new Date().toISOString(),
  ).toLocaleDateString("sq-AL");

  const dischargeClinician = dischargeReport.dischargedBy || currentDoctor.name;
  const mainSurgeon = surgery.team.find(
    (member) => member.role === "Main Surgeon",
  );
  const initialPaper = useMemo(() => {
    const diagnosisAtAdmission =
      epicrisis.diagnoses[0]?.diagnosis ||
      patient.reasonForAdmission ||
      "____________________________";

    const hospitalizationNarrative = [
      patient.reasonForAdmission
        ? `Pacienti/ja pranohet në klinikë për ${patient.reasonForAdmission.toLowerCase()}.`
        : "Pacienti/ja pranohet në klinikë për trajtim ortopedik dhe vlerësim specialistik.",
      epicrisis.diagnoses.length > 0
        ? `Pas ekzaminimeve klinike dhe diagnostike është vendosur diagnoza: ${epicrisis.diagnoses
            .map((diagnosis) => diagnosis.diagnosis)
            .join(", ")}.`
        : "Pas ekzaminimeve klinike dhe diagnostike është vazhduar trajtimi spitalor sipas gjendjes klinike.",
      surgery.surgeryType
        ? `Është realizuar intervenimi operativ: ${surgery.surgeryType}${mainSurgeon?.doctorName ? `, nga ${mainSurgeon.doctorName}` : ""}. ${
            surgery.intraoperativeNotes ||
            "Gjendja gjatë qëndrimit në spital ka qenë stabile."
          }`
        : "Gjatë qëndrimit në spital është ndjekur ecuria klinike dhe është aplikuar trajtimi konservativ sipas nevojës.",
    ].join(" ");

    const inpatientTherapyNarrative =
      epicrisis.medications.length > 0
        ? `Në repart i është ordinuar terapia: ${epicrisis.medications
            .map(
              (medication) =>
                `${medication.name} ${medication.dosage} ${medication.frequency}`,
            )
            .join(", ")}.`
        : "Në repart i është ordinuar terapi simptomatike, analgjezi dhe kujdes i vazhdueshëm ortopedik sipas protokollit.";

    return {
      historyNumber: String(patient.id || "790"),
      patientName: patient.fullName || "____________________________",
      birthDate: formatDate(patient.dateOfBirth),
      birthPlace: patient.address || "____________",
      address: patient.address || "____________",
      profession: patient.emergencyContact ? "I deklaruar" : "____________",
      admissionDate: formatDate(patient.admissionDateTime),
      dischargeDate: dischargeDateLabel,
      diagnosisAtAdmission,
      diagnosisAtDischarge: dischargeReport.finalDiagnosis || diagnosisAtAdmission,
      hospitalizationNarrative,
      inpatientTherapyNarrative,
      specialistName:
        mainSurgeon?.doctorName || currentDoctor.name || "________________",
      headOfUnitName: currentDoctor.name || "________________",
      dischargeClinician,
    };
  }, [
    currentDoctor.name,
    dischargeClinician,
    dischargeDateLabel,
    dischargeReport.finalDiagnosis,
    epicrisis.diagnoses,
    epicrisis.medications,
    mainSurgeon?.doctorName,
    patient.address,
    patient.dateOfBirth,
    patient.emergencyContact,
    patient.fullName,
    patient.id,
    patient.admissionDateTime,
    patient.reasonForAdmission,
    surgery.intraoperativeNotes,
    surgery.surgeryType,
  ]);

  const [paper, setPaper] = useState(() => initialPaper);
  const therapyLines = splitLines(dischargeReport.therapyForHome);
  const followUpLines = splitLines(dischargeReport.followUpInstructions);

  if (!isPatientAdmitted) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient Not Admitted</AlertTitle>
          <AlertDescription>
            Please complete the anamnesis and confirm admission before accessing
            discharge.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/anamnesis")}>
          Go to Anamnesis
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Discharge Report
          </h1>
          <p className="text-muted-foreground">
            Generate final patient discharge documentation
          </p>
        </div>
        <div className="flex items-center gap-3">
          {patient.isDischarged && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-success">Patient Discharged</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 print:hidden">
        <AnamnesisSummary />
        <EpicrisisSummary />
      </div>

      <div className="print:hidden">
        <SurgerySummary />
      </div>

      <Separator className="print:hidden" />

      <Card className="print:hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discharge Instructions</CardTitle>
              <CardDescription>
                Complete these fields before discharge
              </CardDescription>
            </div>
            {patient.isDischarged && (
              <div className="flex items-center gap-2 text-success">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Editable after discharge</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="finalDiagnosis">
              Final Diagnosis <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="finalDiagnosis"
              placeholder="Enter final diagnosis..."
              value={dischargeReport.finalDiagnosis}
              onChange={(e) =>
                updateDischargeReport({ finalDiagnosis: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="therapyForHome">
              Therapy for Home <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="therapyForHome"
              placeholder="Medications and treatments to continue at home..."
              value={dischargeReport.therapyForHome}
              onChange={(e) =>
                updateDischargeReport({ therapyForHome: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpInstructions">
              Follow-up Instructions <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="followUpInstructions"
              placeholder="Follow-up appointments, care instructions, warning signs..."
              value={dischargeReport.followUpInstructions}
              onChange={(e) =>
                updateDischargeReport({ followUpInstructions: e.target.value })
              }
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="print:hidden">
          <h2 className="text-lg font-semibold tracking-tight">
            Final Paper Preview
          </h2>
          <p className="text-sm text-muted-foreground">
            This is the single-page discharge document that will be printed and
            shared with the patient team.
          </p>
        </div>

        <div
          id="discharge-paper"
          className="mx-auto min-h-[297mm] w-full max-w-[210mm] rounded-[28px] border border-stone-300 bg-white p-8 text-black shadow-[0_24px_60px_rgba(15,23,42,0.12)] print:min-h-0 print:max-w-none print:rounded-none print:border print:p-0 print:shadow-none"
        >
          <div className="px-8 py-6">
            <div className="grid grid-cols-[88px_1fr_88px] items-start gap-4">
              <div className="flex justify-start">
                <Image
                  src="/qkuk-logo.jpeg"
                  alt="QKUK logo"
                  width={78}
                  height={82}
                  className="h-auto w-[78px] object-contain"
                />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-[13px] font-bold uppercase tracking-[0.08em]">
                  QENDRA KLINIKE UNIVERSITARE E KOSOVËS
                </p>
                <p className="text-[13px] font-bold uppercase tracking-[0.06em]">
                  KLINIKA E ORTOPEDISË DHE TRAUMATOLOGJISË LOKOMOTORE PRISHTINË
                </p>
                <h2 className="pt-4 text-[32px] font-black tracking-[0.18em]">
                  FLETËLËSHIM
                </h2>
              </div>
              <div className="flex justify-end">
                <Image
                  src="/clinic-tree.png"
                  alt="Clinic emblem"
                  width={80}
                  height={84}
                  className="h-auto w-[80px] object-contain"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <div className="min-w-[220px] text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-black/60 pb-1">
                  <span className="font-medium">Numri i historisë:</span>
                  <span className="min-w-[110px] text-right font-semibold">
                    {paper.historyNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-8 pb-8 text-[14px] leading-6">
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_200px] gap-6">
                <div className="border-b border-black/60 pb-1">
                  <span className="font-medium">
                    Emri, emri i prindit, mbiemri:
                  </span>{" "}
                  <span className="pl-3 font-semibold">
                    <span className="hidden print:inline">{paper.patientName}</span>
                    <input
                      className="w-full bg-transparent font-semibold outline-none print:hidden"
                      value={paper.patientName}
                      onChange={(e) =>
                        setPaper((prev) => ({ ...prev, patientName: e.target.value }))
                      }
                    />
                  </span>
                </div>
                <div className="border-b border-black/60 pb-1">
                  <span className="font-medium">Data e lindjes:</span>{" "}
                  <span className="pl-3 font-semibold">
                    <span className="hidden print:inline">{paper.birthDate}</span>
                    <input
                      className="w-full bg-transparent font-semibold outline-none print:hidden"
                      value={paper.birthDate}
                      onChange={(e) =>
                        setPaper((prev) => ({ ...prev, birthDate: e.target.value }))
                      }
                    />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr] gap-6">
                <div className="border-b border-black/60 pb-1">
                  <span className="font-medium">Vendlindja:</span>{" "}
                  <span className="pl-3">
                    <span className="hidden print:inline">{paper.birthPlace}</span>
                    <input
                      className="w-full bg-transparent outline-none print:hidden"
                      value={paper.birthPlace}
                      onChange={(e) =>
                        setPaper((prev) => ({ ...prev, birthPlace: e.target.value }))
                      }
                    />
                  </span>
                </div>
                <div className="border-b border-black/60 pb-1">
                  <span className="font-medium">Adresa:</span>{" "}
                  <span className="pl-3">
                    <span className="hidden print:inline">{paper.address}</span>
                    <input
                      className="w-full bg-transparent outline-none print:hidden"
                      value={paper.address}
                      onChange={(e) =>
                        setPaper((prev) => ({ ...prev, address: e.target.value }))
                      }
                    />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr] gap-6">
                <div className="border-b border-black/60 pb-1">
                  <span className="font-medium">Profesioni:</span>{" "}
                  <span className="pl-3">
                    <span className="hidden print:inline">{paper.profession}</span>
                    <input
                      className="w-full bg-transparent outline-none print:hidden"
                      value={paper.profession}
                      onChange={(e) =>
                        setPaper((prev) => ({ ...prev, profession: e.target.value }))
                      }
                    />
                  </span>
                </div>
                <div className="border-b border-black/60 pb-1">
                  <span className="font-medium">Është mjekuar nga data:</span>{" "}
                  <span className="pl-3 font-semibold">
                    <span className="hidden print:inline">{paper.admissionDate}</span>
                    <input
                      className="w-[120px] bg-transparent font-semibold outline-none print:hidden"
                      value={paper.admissionDate}
                      onChange={(e) =>
                        setPaper((prev) => ({
                          ...prev,
                          admissionDate: e.target.value,
                        }))
                      }
                    />
                  </span>
                  <span className="pl-4 font-medium">deri më:</span>{" "}
                  <span className="pl-3 font-semibold">
                    <span className="hidden print:inline">{paper.dischargeDate}</span>
                    <input
                      className="w-[120px] bg-transparent font-semibold outline-none print:hidden"
                      value={paper.dischargeDate}
                      onChange={(e) =>
                        setPaper((prev) => ({
                          ...prev,
                          dischargeDate: e.target.value,
                        }))
                      }
                    />
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[160px_1fr] gap-4">
                <div className="font-medium">Diagnoza në pranim:</div>
                <div className="border-b border-black/60 pb-1 font-semibold">
                  <span className="hidden print:inline">
                    {paper.diagnosisAtAdmission}
                  </span>
                  <input
                    className="w-full bg-transparent font-semibold outline-none print:hidden"
                    value={paper.diagnosisAtAdmission}
                    onChange={(e) =>
                      setPaper((prev) => ({
                        ...prev,
                        diagnosisAtAdmission: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-[160px_1fr] gap-4">
                <div className="font-medium">në lëshim:</div>
                <div className="border-b border-black/60 pb-1 font-semibold">
                  <span className="hidden print:inline">
                    {paper.diagnosisAtDischarge}
                  </span>
                  <input
                    className="w-full bg-transparent font-semibold outline-none print:hidden"
                    value={paper.diagnosisAtDischarge}
                    onChange={(e) =>
                      setPaper((prev) => ({
                        ...prev,
                        diagnosisAtDischarge: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 text-justify">
              <p>
                <span className="hidden print:inline">
                  {paper.hospitalizationNarrative}
                </span>
                <textarea
                  className="w-full resize-none bg-transparent outline-none print:hidden"
                  value={paper.hospitalizationNarrative}
                  rows={4}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      hospitalizationNarrative: e.target.value,
                    }))
                  }
                />
              </p>
              <p>
                <span className="hidden print:inline">
                  {paper.inpatientTherapyNarrative}
                </span>
                <textarea
                  className="w-full resize-none bg-transparent outline-none print:hidden"
                  value={paper.inpatientTherapyNarrative}
                  rows={3}
                  onChange={(e) =>
                    setPaper((prev) => ({
                      ...prev,
                      inpatientTherapyNarrative: e.target.value,
                    }))
                  }
                />
              </p>
              {followUpLines.length > 0 ? (
                <div>
                  {followUpLines.map((line, index) => (
                    <p key={`${line}-${index}`}>{line}</p>
                  ))}
                </div>
              ) : (
                <p>
                  Kontrolla sipas udhëzimit të mjekut ordinues në ambulantën
                  specialistike të ortopedisë me fletëlëshim.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-bold">Th:</p>
              {therapyLines.length > 0 ? (
                <ul className="space-y-1 pl-6">
                  {therapyLines.map((line, index) => (
                    <li key={`${line}-${index}`} className="list-disc">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pl-6">____________________________</p>
              )}
            </div>

            <div className="space-y-1">
              {followUpLines.length > 0 ? (
                followUpLines.map((line, index) => (
                  <p key={`follow-up-${index}`}>{line}</p>
                ))
              ) : (
                <>
                  <p>Pastrimi i plagës sipas udhëzimit të mjekut.</p>
                  <p>Kontrolla në ambulantën specialistike të ortopedisë.</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-3 pt-12 text-center text-[13px]">
              <div className="space-y-2">
                <p className="font-medium">Specialisti në repart:</p>
                <div className="pt-2">
                  <p className="font-semibold">
                    <span className="hidden print:inline">
                      {paper.specialistName}
                    </span>
                    <input
                      className="w-full bg-transparent text-center font-semibold outline-none print:hidden"
                      value={paper.specialistName}
                      onChange={(e) =>
                        setPaper((prev) => ({
                          ...prev,
                          specialistName: e.target.value,
                        }))
                      }
                    />
                  </p>
                  <p>ortoped</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium">UD Shefi i repartit:</p>
                <div className="pt-2">
                  <p className="font-semibold">
                    <span className="hidden print:inline">
                      {paper.specialistName}
                    </span>
                    <input
                      className="w-full bg-transparent text-center font-semibold outline-none print:hidden"
                      value={paper.specialistName}
                      onChange={(e) =>
                        setPaper((prev) => ({
                          ...prev,
                          specialistName: e.target.value,
                        }))
                      }
                    />
                  </p>
                  <p>ortoped</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Mjeku në repart:</p>
                <div className="pt-2">
                  <p className="font-semibold">
                    <span className="hidden print:inline">
                      {paper.dischargeClinician}
                    </span>
                    <input
                      className="w-full bg-transparent text-center font-semibold outline-none print:hidden"
                      value={paper.dischargeClinician}
                      onChange={(e) =>
                        setPaper((prev) => ({
                          ...prev,
                          dischargeClinician: e.target.value,
                        }))
                      }
                    />
                  </p>
                  <p>specializant</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Drejtori i Klinikës:</p>
                <div className="pt-2">
                  <p className="font-semibold">
                    <span className="hidden print:inline">
                      {paper.headOfUnitName}
                    </span>
                    <input
                      className="w-full bg-transparent text-center font-semibold outline-none print:hidden"
                      value={paper.headOfUnitName}
                      onChange={(e) =>
                        setPaper((prev) => ({
                          ...prev,
                          headOfUnitName: e.target.value,
                        }))
                      }
                    />
                  </p>
                  <p>ortoped</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between rounded-lg border bg-card p-4 print:hidden">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>
            Complete all fields before generating the discharge report
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={!isFormComplete}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {canEdit && (
            <>
              <Button
                onClick={() => void handleDischarge()}
                disabled={!isFormComplete}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Discharged
              </Button>
              <Button
                onClick={() => void handleDischargeAndReset()}
                variant="default"
                disabled={!isFormComplete}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Discharge & New Patient
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
