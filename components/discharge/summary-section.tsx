"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClinic } from "@/lib/clinic-context"
import { User, Calendar, MapPin, Phone, AlertTriangle, Pill, Stethoscope, Syringe } from "lucide-react"

export function AnamnesisSummary() {
  const { patient } = useClinic()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Të dhënat e pacientit</CardTitle>
        <CardDescription>Përmbledhje e anamnezës</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Emri i plotë</p>
              <p className="font-medium">{patient.fullName || "Nuk është dhënë"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Data e lindjes</p>
              <p className="font-medium">
                {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Nuk është dhënë"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Adresa</p>
              <p className="font-medium">{patient.address || "Nuk është dhënë"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Telefoni</p>
              <p className="font-medium">{patient.phone || "Nuk është dhënë"}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="mb-2 font-medium">Arsyeja e pranimit</h4>
          <p className="text-sm text-muted-foreground">{patient.reasonForAdmission || "Nuk është dokumentuar"}</p>
        </div>

        {patient.allergies && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Alergjitë</p>
              <p className="text-sm text-muted-foreground">{patient.allergies}</p>
            </div>
          </div>
        )}

        {patient.currentMedications && (
          <div className="flex items-start gap-2">
            <Pill className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Barnat aktuale (në pranim)</p>
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
        <CardTitle className="text-lg">Përmbledhja e hospitalizimit</CardTitle>
        <CardDescription>Përmbledhje e epikrizës</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Diagnozat ({epicrisis.diagnoses.length})</h4>
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
            <p className="mt-2 text-sm text-muted-foreground">Nuk ka diagnoza të regjistruara</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Syringe className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Procedurat ({epicrisis.procedures.length})</h4>
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
            <p className="mt-2 text-sm text-muted-foreground">Nuk ka procedura të regjistruara</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            <h4 className="font-medium">Terapia gjatë qëndrimit ({epicrisis.medications.length})</h4>
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
            <p className="mt-2 text-sm text-muted-foreground">Nuk ka terapi të regjistruar</p>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Shënime ditore: {epicrisis.progressNotes.length} | Analiza gjaku: {epicrisis.bloodTests.length}
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
          <CardTitle className="text-lg">Operacioni</CardTitle>
          <CardDescription>Pacienti nuk është operuar</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nuk është kryer asnjë procedurë kirurgjikale gjatë këtij pranimi.</p>
        </CardContent>
      </Card>
    )
  }

  const mainSurgeon = surgery.team.find((m) => m.role === "Main Surgeon")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Përmbledhja e operacionit</CardTitle>
        <CardDescription>Detajet e procedurës kirurgjikale</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Lloji i operacionit</p>
            <p className="font-medium">{surgery.surgeryType || "Nuk është specifikuar"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data dhe ora</p>
            <p className="font-medium">
              {surgery.date ? new Date(surgery.date).toLocaleDateString() : "Nuk është specifikuar"}
              {surgery.time && ` at ${surgery.time}`}
            </p>
          </div>
        </div>

        {mainSurgeon && (
          <div>
            <p className="text-sm text-muted-foreground">Kirurgu kryesor</p>
            <p className="font-medium">{mainSurgeon.doctorName}</p>
          </div>
        )}

        {surgery.intraoperativeNotes && (
          <div>
            <p className="text-sm text-muted-foreground">Shënime intraoperative</p>
            <p className="mt-1 text-sm">{surgery.intraoperativeNotes}</p>
          </div>
        )}

        {surgery.team.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Ekipi operativ: {surgery.team.map((m) => `${m.doctorName} (${m.role})`).join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
