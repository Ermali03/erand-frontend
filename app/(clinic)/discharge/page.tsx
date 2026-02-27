"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useClinic } from "@/lib/clinic-context"
import { AnamnesisSummary, EpicrisisSummary, SurgerySummary } from "@/components/discharge/summary-section"
import { AlertCircle, Printer, FileCheck, Lock, CheckCircle } from "lucide-react"

export default function DischargePage() {
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
  const { isPatientAdmitted, patient, dischargeReport, updateDischargeReport, dischargePatient, hasPermission } =
    useClinic()
  const [showPreview, setShowPreview] = useState(false)

  const canEdit = hasPermission("discharge") && !patient.isDischarged

  if (!isPatientAdmitted) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient Not Admitted</AlertTitle>
          <AlertDescription>
            Please complete the anamnesis and confirm admission before accessing discharge.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/anamnesis")}>
          Go to Anamnesis
        </Button>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDischarge = () => {
    if (!dischargeReport.finalDiagnosis || !dischargeReport.therapyForHome || !dischargeReport.followUpInstructions) {
      return
    }
    dischargePatient()
  }

  const isFormComplete =
    dischargeReport.finalDiagnosis && dischargeReport.therapyForHome && dischargeReport.followUpInstructions

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Discharge Report</h1>
          <p className="text-muted-foreground">Generate final patient discharge documentation</p>
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

      {/* Read-only Summaries */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnamnesisSummary />
        <EpicrisisSummary />
      </div>
      <SurgerySummary />

      <Separator />

      {/* Editable Discharge Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Discharge Instructions</CardTitle>
              <CardDescription>Complete these fields before discharge</CardDescription>
            </div>
            {patient.isDischarged && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Locked</span>
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
              onChange={(e) => updateDischargeReport({ finalDiagnosis: e.target.value })}
              disabled={!canEdit}
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
              onChange={(e) => updateDischargeReport({ therapyForHome: e.target.value })}
              disabled={!canEdit}
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
              onChange={(e) => updateDischargeReport({ followUpInstructions: e.target.value })}
              disabled={!canEdit}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Print Preview */}
      {showPreview && (
        <Card className="print:shadow-none" ref={printRef}>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Discharge Summary</CardTitle>
                <CardDescription>MediClinic</CardDescription>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Patient ID: {patient.id}</p>
                <p>
                  Discharge Date:{" "}
                  {dischargeReport.dischargeDate
                    ? new Date(dischargeReport.dischargeDate).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-semibold">Patient Information</h3>
              <p className="text-sm">
                {patient.fullName}, {patient.gender}, DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Final Diagnosis</h3>
              <p className="text-sm">{dischargeReport.finalDiagnosis}</p>
            </div>

            <div>
              <h3 className="font-semibold">Therapy for Home</h3>
              <p className="whitespace-pre-wrap text-sm">{dischargeReport.therapyForHome}</p>
            </div>

            <div>
              <h3 className="font-semibold">Follow-up Instructions</h3>
              <p className="whitespace-pre-wrap text-sm">{dischargeReport.followUpInstructions}</p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Discharged by: {dischargeReport.dischargedBy || "Pending"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>Complete all fields before generating the discharge report</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <FileCheck className="mr-2 h-4 w-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="outline" onClick={handlePrint} disabled={!isFormComplete}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {canEdit && (
            <Button onClick={handleDischarge} disabled={!isFormComplete}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Discharged
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
