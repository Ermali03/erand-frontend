"use client"

import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useClinic } from "@/lib/clinic-context"
import { User, Calendar, Stethoscope } from "lucide-react"
import type { PatientStatus } from "@/lib/types"

const statusConfig: Record<PatientStatus, { label: string; className: string }> = {
  admitted: { label: "Admitted", className: "bg-info text-info-foreground" },
  "in-treatment": { label: "In Treatment", className: "bg-warning text-warning-foreground" },
  operated: { label: "Operated", className: "bg-primary text-primary-foreground" },
  discharged: { label: "Discharged", className: "bg-success text-success-foreground" },
}

export function PatientHeader() {
  const { patient, isPatientAdmitted, currentDoctor, setCurrentDoctor, doctors } = useClinic()

  if (!isPatientAdmitted) {
    return (
      <header className="sticky top-0 z-40 border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No patient admitted</p>
              <p className="text-xs text-muted-foreground/70">Complete anamnesis to admit a patient</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <Select
                value={currentDoctor.id}
                onValueChange={(id) => {
                  const doctor = doctors.find((d) => d.id === id)
                  if (doctor) setCurrentDoctor(doctor)
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">{doctor.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const status = statusConfig[patient.status]

  return (
    <header className="sticky top-0 z-40 border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{patient.fullName || "Patient Name"}</h2>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{patient.id}</span>
              {patient.dateOfBirth && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <Select
              value={currentDoctor.id}
              onValueChange={(id) => {
                const doctor = doctors.find((d) => d.id === id)
                if (doctor) setCurrentDoctor(doctor)
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    <div className="flex flex-col">
                      <span>{doctor.name}</span>
                      <span className="text-xs text-muted-foreground">{doctor.role}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  )
}
