"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinic } from "@/lib/clinic-context"
import { User, Calendar, MapPin, Phone, AlertTriangle, Pill, Stethoscope, Syringe } from "lucide-react"

export function AnamnesisSummary() {
  const { patient } = useClinic()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Patient Information</CardTitle>
        <CardDescription>Anamnesis summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{patient.fullName || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not provided"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{patient.address || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{patient.phone || "Not provided"}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="mb-2 font-medium">Reason for Admission</h4>
          <p className="text-sm text-muted-foreground">{patient.reasonForAdmission || "Not documented"}</p>
        </div>

        {patient.allergies && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Allergies</p>
              <p className="text-sm text-muted-foreground">{patient.allergies}</p>
            </div>
          </div>
        )}

        {patient.currentMedications && (
          <div className="flex items-start gap-2">
            <Pill className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Current Medications (on admission)</p>
              <p className="text-sm">{patient.currentMedications}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function EpicrisisSummary() {
  const { epicrisis } = useClinic()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hospitalization Summary</CardTitle>
        <CardDescription>Epicrisis overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Diagnoses ({epicrisis.diagnoses.length})</h4>
          </div>
          {epicrisis.diagnoses.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {epicrisis.diagnoses.map((d) => (
                <li key={d.id} className="text-muted-foreground">
                  • {d.diagnosis} {d.icdCode && <span className="font-mono">({d.icdCode})</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No diagnoses recorded</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Procedures ({epicrisis.procedures.length})</h4>
          </div>
          {epicrisis.procedures.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {epicrisis.procedures.map((p) => (
                <li key={p.id} className="text-muted-foreground">
                  • {p.procedureName} ({p.date})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No procedures recorded</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Medications During Stay ({epicrisis.medications.length})</h4>
          </div>
          {epicrisis.medications.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {epicrisis.medications.map((m) => (
                <li key={m.id} className="text-muted-foreground">
                  • {m.name} {m.dosage} - {m.frequency} ({m.route.toUpperCase()})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No medications recorded</p>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Progress Notes: {epicrisis.progressNotes.length} | Blood Tests: {epicrisis.bloodTests.length}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function SurgerySummary() {
  const { patient, surgery } = useClinic()

  if (!patient.isOperated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Surgery</CardTitle>
          <CardDescription>Patient was not operated</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No surgical procedure was performed during this admission.</p>
        </CardContent>
      </Card>
    )
  }

  const mainSurgeon = surgery.team.find((m) => m.role === "Main Surgeon")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Surgery Summary</CardTitle>
        <CardDescription>Surgical procedure details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Surgery Type</p>
            <p className="font-medium">{surgery.surgeryType || "Not specified"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date & Time</p>
            <p className="font-medium">
              {surgery.date ? new Date(surgery.date).toLocaleDateString() : "Not specified"}
              {surgery.time && ` at ${surgery.time}`}
            </p>
          </div>
        </div>

        {mainSurgeon && (
          <div>
            <p className="text-sm text-muted-foreground">Main Surgeon</p>
            <p className="font-medium">{mainSurgeon.doctorName}</p>
          </div>
        )}

        {surgery.intraoperativeNotes && (
          <div>
            <p className="text-sm text-muted-foreground">Intraoperative Notes</p>
            <p className="mt-1 text-sm">{surgery.intraoperativeNotes}</p>
          </div>
        )}

        {surgery.team.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Operating Team: {surgery.team.map((m) => `${m.doctorName} (${m.role})`).join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
