"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useClinic } from "@/lib/clinic-context"
import type { SurgeryTeamMember } from "@/lib/types"
import { AlertCircle, Lock, UserPlus, Trash2, Crown, Shield, Eye } from "lucide-react"

type TeamRole = SurgeryTeamMember["role"]

const roleConfig: Record<TeamRole, { icon: typeof Crown; label: string; canEdit: boolean }> = {
  "Main Surgeon": { icon: Crown, label: "Main Surgeon", canEdit: true },
  "Assistant Surgeon": { icon: Shield, label: "Assistant", canEdit: false },
  Anesthesiologist: { icon: Shield, label: "Anesthesiologist", canEdit: false },
  "Anesthesia Nurse": { icon: Eye, label: "Anesthesia Nurse", canEdit: false },
}

export default function SurgeryPage() {
  const router = useRouter()
  const { isPatientAdmitted, patient, surgery, updateSurgery, doctors, hasPermission } = useClinic()
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedRole, setSelectedRole] = useState<TeamRole>("Assistant Surgeon")

  const canEdit = hasPermission("surgery") && !patient.isDischarged

  // Redirect if patient not admitted or not operated
  if (!isPatientAdmitted) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Patient Not Admitted</AlertTitle>
          <AlertDescription>
            Please complete the anamnesis and confirm admission before accessing surgery records.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/anamnesis")}>
          Go to Anamnesis
        </Button>
      </div>
    )
  }

  if (!patient.isOperated) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Surgery Not Enabled</AlertTitle>
          <AlertDescription>
            Enable the "Patient Operated" toggle in the Epicrisis page to access surgery records.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/epicrisis")}>
          Go to Epicrisis
        </Button>
      </div>
    )
  }

  const handleAddTeamMember = () => {
    if (!selectedDoctor) return

    const doctor = doctors.find((d) => d.id === selectedDoctor)
    if (!doctor) return

    // Check if already in team
    if (surgery.team.some((m) => m.doctorId === selectedDoctor)) return

    const newMember: SurgeryTeamMember = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      role: selectedRole,
      canEdit: selectedRole === "Main Surgeon",
    }

    updateSurgery({ team: [...surgery.team, newMember] })
    setSelectedDoctor("")
    setSelectedRole("Assistant Surgeon")
  }

  const handleRemoveTeamMember = (doctorId: string) => {
    updateSurgery({ team: surgery.team.filter((m) => m.doctorId !== doctorId) })
  }

  const handleSetMainSurgeon = (doctorId: string) => {
    const updatedTeam = surgery.team.map((member) => ({
      ...member,
      role:
        member.doctorId === doctorId
          ? ("Main Surgeon" as const)
          : member.role === "Main Surgeon"
            ? ("Assistant Surgeon" as const)
            : member.role,
      canEdit: member.doctorId === doctorId,
    }))
    updateSurgery({ team: updatedTeam })
  }

  const availableDoctors = doctors.filter((d) => !surgery.team.some((m) => m.doctorId === d.id))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Surgery Record</h1>
          <p className="text-muted-foreground">Document surgical procedure details</p>
        </div>
        {patient.isDischarged && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Form locked after discharge</span>
          </div>
        )}
      </div>

      {/* Surgery Details */}
      <Card>
        <CardHeader>
          <CardTitle>Surgery Details</CardTitle>
          <CardDescription>Basic information about the surgical procedure</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="surgeryDate">Surgery Date</Label>
            <Input
              id="surgeryDate"
              type="date"
              value={surgery.date}
              onChange={(e) => updateSurgery({ date: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="surgeryTime">Surgery Time</Label>
            <Input
              id="surgeryTime"
              type="time"
              value={surgery.time}
              onChange={(e) => updateSurgery({ time: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="surgeryType">Surgery Type</Label>
            <Input
              id="surgeryType"
              placeholder="e.g., Laparoscopic Cholecystectomy"
              value={surgery.surgeryType}
              onChange={(e) => updateSurgery({ surgeryType: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="intraoperativeNotes">Intraoperative Notes</Label>
            <Textarea
              id="intraoperativeNotes"
              placeholder="Document findings, techniques, complications..."
              value={surgery.intraoperativeNotes}
              onChange={(e) => updateSurgery({ intraoperativeNotes: e.target.value })}
              disabled={!canEdit}
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Team */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Team</CardTitle>
          <CardDescription>Team members involved in the surgery</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {canEdit && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="teamDoctor">Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger id="teamDoctor">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamRole">Role</Label>
                <Select value={selectedRole} onValueChange={(value: TeamRole) => setSelectedRole(value)}>
                  <SelectTrigger id="teamRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Surgeon">Main Surgeon</SelectItem>
                    <SelectItem value="Assistant Surgeon">Assistant Surgeon</SelectItem>
                    <SelectItem value="Anesthesiologist">Anesthesiologist</SelectItem>
                    <SelectItem value="Anesthesia Nurse">Anesthesia Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddTeamMember} disabled={!selectedDoctor} size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>
          )}

          {surgery.team.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No team members added yet</p>
          ) : (
            <div className="space-y-3">
              {surgery.team.map((member) => {
                const config = roleConfig[member.role]
                const Icon = config.icon

                return (
                  <div
                    key={member.doctorId}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          member.role === "Main Surgeon" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{member.doctorName}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === "Main Surgeon" ? "default" : "secondary"} className="text-xs">
                            {member.role}
                          </Badge>
                          {member.canEdit ? (
                            <span className="text-xs text-success">Can edit</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">View only</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-2">
                        {member.role !== "Main Surgeon" && (
                          <Button variant="ghost" size="sm" onClick={() => handleSetMainSurgeon(member.doctorId)}>
                            <Crown className="mr-2 h-4 w-4" />
                            Set as Main
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTeamMember(member.doctorId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/epicrisis")}>
          Back to Epicrisis
        </Button>
        <Button onClick={() => router.push("/discharge")}>Continue to Discharge</Button>
      </div>
    </div>
  )
}
