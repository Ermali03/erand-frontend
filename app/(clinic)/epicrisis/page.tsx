"use client"

import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useClinic } from "@/lib/clinic-context"
import { ProgressNotesSection } from "@/components/epicrisis/progress-notes-section"
import { DiagnosesSection } from "@/components/epicrisis/diagnoses-section"
import { BloodTestsSection } from "@/components/epicrisis/blood-tests-section"
import { ProceduresSection } from "@/components/epicrisis/procedures-section"
import { MedicationsSection } from "@/components/epicrisis/medications-section"
import { AlertCircle, Lock, Scissors } from "lucide-react"

export default function EpicrisisPage() {
  const router = useRouter()
  const { isPatientAdmitted, patient, updatePatient, hasPermission } = useClinic()

  if (!isPatientAdmitted) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient Not Admitted</AlertTitle>
          <AlertDescription>
            Please complete the anamnesis and confirm admission before accessing epicrisis.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/anamnesis")}>
          Go to Anamnesis
        </Button>
      </div>
    )
  }

  const handleSurgeryToggle = (checked: boolean) => {
    updatePatient({
      isOperated: checked,
      status: checked ? "operated" : "in-treatment",
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Epicrisis</h1>
          <p className="text-muted-foreground">Track everything during hospitalization</p>
        </div>
        <div className="flex items-center gap-4">
          {patient.isDischarged && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Form locked after discharge</span>
            </div>
          )}
          {hasPermission("surgery") && !patient.isDischarged && (
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="surgery-toggle" className="text-sm">
                Patient Operated
              </Label>
              <Switch id="surgery-toggle" checked={patient.isOperated} onCheckedChange={handleSurgeryToggle} />
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="progress">Progress Notes</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="bloodtests">Blood Tests</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
        </TabsList>
        <TabsContent value="progress" className="mt-6">
          <ProgressNotesSection />
        </TabsContent>
        <TabsContent value="diagnoses" className="mt-6">
          <DiagnosesSection />
        </TabsContent>
        <TabsContent value="bloodtests" className="mt-6">
          <BloodTestsSection />
        </TabsContent>
        <TabsContent value="procedures" className="mt-6">
          <ProceduresSection />
        </TabsContent>
        <TabsContent value="medications" className="mt-6">
          <MedicationsSection />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/anamnesis")}>
          Back to Anamnesis
        </Button>
        {patient.isOperated && (
          <Button variant="outline" onClick={() => router.push("/surgery")}>
            View Surgery
          </Button>
        )}
        <Button onClick={() => router.push("/discharge")}>Continue to Discharge</Button>
      </div>
    </div>
  )
}
