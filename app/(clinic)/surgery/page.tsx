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
  "Main Surgeon": { icon: Crown, label: "Kirurgu kryesor", canEdit: true },
  "Assistant Surgeon": { icon: Shield, label: "Asistent", canEdit: false },
  Anesthesiologist: { icon: Shield, label: "Anesteziolog", canEdit: false },
  "Anesthesia Nurse": { icon: Eye, label: "Infermier/e e anestezionit", canEdit: false },
}

export default function SurgeryPage() {
  const router = useRouter()
  const { isPatientAdmitted, patient, surgery, updateSurgery, doctors, hasPermission } = useClinic()
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedRole, setSelectedRole] = useState<TeamRole>("Assistant Surgeon")

  const canEdit = hasPermission("surgery")

  // Redirect if patient not admitted or not operated
  if (!isPatientAdmitted) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pacienti nuk është pranuar</AlertTitle>
          <AlertDescription>
            Ju lutem plotësoni anamnezën dhe konfirmoni pranimin para se të hapni kartelën e operacionit.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/anamnesis")}>
          Shko te anamneza
        </Button>
      </div>
    )
  }

  if (!patient.isOperated) {
    return (
      <div className="mx-auto max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Operacioni nuk është aktivizuar</AlertTitle>
          <AlertDescription>
            Aktivizoni opsionin &quot;Pacienti është operuar&quot; në faqen e epikrizës për të hapur kartelën e operacionit.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/epicrisis")}>
          Shko te epikriza
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
          <h1 className="text-2xl font-bold text-foreground">Kartela e operacionit</h1>
          <p className="text-muted-foreground">Dokumentoni detajet e procedurës kirurgjikale</p>
        </div>
        {patient.isDischarged && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
            <Lock className="h-4 w-4 text-success" />
            <span className="text-sm text-success">Pacienti është lëshuar, por modifikimi lejohet</span>
          </div>
        )}
      </div>

      {/* Surgery Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detajet e operacionit</CardTitle>
          <CardDescription>Informacioni bazë për procedurën kirurgjikale</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="surgeryDate">Data e operacionit</Label>
            <Input
              id="surgeryDate"
              type="date"
              value={surgery.date}
              onChange={(e) => updateSurgery({ date: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="surgeryTime">Ora e operacionit</Label>
            <Input
              id="surgeryTime"
              type="time"
              value={surgery.time}
              onChange={(e) => updateSurgery({ time: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="surgeryType">Lloji i operacionit</Label>
            <Input
              id="surgeryType"
              placeholder="p.sh. Artroplastikë totale e hipit"
              value={surgery.surgeryType}
              onChange={(e) => updateSurgery({ surgeryType: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="intraoperativeNotes">Shënime intraoperative</Label>
            <Textarea
              id="intraoperativeNotes"
              placeholder="Dokumentoni gjetjet, teknikat, komplikimet..."
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
          <CardTitle>Ekipi operativ</CardTitle>
          <CardDescription>Anëtarët e ekipit të përfshirë në operacion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {canEdit && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="teamDoctor">Mjeku</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger id="teamDoctor">
                    <SelectValue placeholder="Zgjidhni mjekun" />
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
                <Label htmlFor="teamRole">Roli</Label>
                <Select value={selectedRole} onValueChange={(value: TeamRole) => setSelectedRole(value)}>
                  <SelectTrigger id="teamRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main Surgeon">Kirurgu kryesor</SelectItem>
                    <SelectItem value="Assistant Surgeon">Kirurg asistent</SelectItem>
                    <SelectItem value="Anesthesiologist">Anesteziolog</SelectItem>
                    <SelectItem value="Anesthesia Nurse">Infermier/e e anestezionit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleAddTeamMember} disabled={!selectedDoctor} size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Shto anëtar
                </Button>
              </div>
            </div>
          )}

          {surgery.team.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Ende nuk ka anëtarë të ekipit</p>
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
                            <span className="text-xs text-success">Mund të modifikojë</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Vetëm shikim</span>
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
          Kthehu te epikriza
        </Button>
        <Button onClick={() => router.push("/discharge")}>Vazhdo te lëshimi</Button>
      </div>
    </div>
  )
}
