"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useClinic } from "@/lib/clinic-context"
import { Save, CheckCircle, AlertCircle, Lock, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ApiError } from "@/lib/api"

export default function AnamnesisPage() {
  const router = useRouter()
  const {
    patient,
    updatePatient,
    isPatientAdmitted,
    savePatientDraft,
    confirmAdmission,
    startNewPatient,
    hasPermission,
  } = useClinic()
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)
  const [savedMessage, setSavedMessage] = useState("Draft-i u ruajt me sukses")
  const [errorMessage, setErrorMessage] = useState("")

  const canEdit = hasPermission("edit")
  const hasExistingRecord = Boolean(patient.id)
  const isDraftRecord = patient.status === "draft"

  const handleSaveDraft = async () => {
    setIsSaving(true)
    setErrorMessage("")

    try {
      await savePatientDraft()
      setSavedMessage("Draft-i u ruajt me sukses")
      setShowSavedMessage(true)
      setTimeout(() => setShowSavedMessage(false), 3000)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Ruajtja e draft-it të pacientit dështoi",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmAdmission = async () => {
    if (!patient.fullName || !patient.dateOfBirth || !patient.reasonForAdmission) {
      return
    }

    setIsSaving(true)
    setErrorMessage("")

    try {
      await confirmAdmission()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Ruajtja e pranimit të pacientit dështoi",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = patient.fullName && patient.dateOfBirth && patient.reasonForAdmission

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Anamneza e pacientit</h1>
          <p className="text-muted-foreground">Regjistroni pacientin e ri në momentin e pranimit</p>
        </div>
        <div className="flex items-center gap-3">
          {patient.isDischarged && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
              <Lock className="h-4 w-4 text-success" />
              <span className="text-sm text-success">Pacienti është lëshuar, por modifikimi lejohet</span>
            </div>
          )}
          {(isPatientAdmitted || hasExistingRecord) && (
            <Button
              variant="outline"
              onClick={() => {
                startNewPatient()
                router.push("/anamnesis")
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Pacient i ri
            </Button>
          )}
        </div>
      </div>

      {showSavedMessage && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{savedMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Të dhënat personale</CardTitle>
          <CardDescription>Të dhënat bazë të pacientit</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">
              Emri i plotë <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Shkruani emrin e plotë të pacientit"
              value={patient.fullName}
              onChange={(e) => updatePatient({ fullName: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Data e lindjes <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={patient.dateOfBirth}
              onChange={(e) => updatePatient({ dateOfBirth: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label>Gjinia</Label>
            <RadioGroup
              value={patient.gender}
              onValueChange={(value: "male" | "female" | "other") => updatePatient({ gender: value })}
              disabled={!canEdit}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal">
                  Mashkull
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal">
                  Femër
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">
                  Tjetër
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Adresa</Label>
            <Input
              id="address"
              placeholder="Shkruani adresën e pacientit"
              value={patient.address}
              onChange={(e) => updatePatient({ address: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoni</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={patient.phone}
              onChange={(e) => updatePatient({ phone: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Kontakt emergjent</Label>
            <Input
              id="emergencyContact"
              placeholder="Emri dhe numri i telefonit"
              value={patient.emergencyContact}
              onChange={(e) => updatePatient({ emergencyContact: e.target.value })}
              disabled={!canEdit}
            />
          </div>
        </CardContent>
      </Card>

      {/* Admission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detajet e pranimit</CardTitle>
          <CardDescription>Informacion për pranimin aktual</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admissionSource">Burimi i pranimit</Label>
            <Select
              value={patient.admissionSource}
              onValueChange={(value: "ED" | "Clinic") => updatePatient({ admissionSource: value })}
              disabled={!canEdit}
            >
              <SelectTrigger id="admissionSource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ED">Urgjenca</SelectItem>
                <SelectItem value="Clinic">Klinika</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admissionDateTime">Data dhe ora e pranimit</Label>
            <Input
              id="admissionDateTime"
              type="datetime-local"
              value={patient.admissionDateTime}
              onChange={(e) => updatePatient({ admissionDateTime: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="reasonForAdmission">
              Arsyeja e pranimit <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reasonForAdmission"
              placeholder="Përshkruani arsyen e pranimit"
              value={patient.reasonForAdmission}
              onChange={(e) => updatePatient({ reasonForAdmission: e.target.value })}
              disabled={!canEdit}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle>Historia mjekësore</CardTitle>
          <CardDescription>Prapavija mjekësore e pacientit</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="pastMedicalHistory">Historia e kaluar mjekësore</Label>
            <Textarea
              id="pastMedicalHistory"
              placeholder="Sëmundje të mëparshme, operacione, hospitalizime..."
              value={patient.pastMedicalHistory}
              onChange={(e) => updatePatient({ pastMedicalHistory: e.target.value })}
              disabled={!canEdit}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergjitë</Label>
            <Textarea
              id="allergies"
              placeholder="Shkruani alergjitë e njohura (ilaçe, ushqime, mjedis)..."
              value={patient.allergies}
              onChange={(e) => updatePatient({ allergies: e.target.value })}
              disabled={!canEdit}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">Barnat aktuale</Label>
            <Textarea
              id="currentMedications"
              placeholder="Shkruani barnat aktuale me dozat..."
              value={patient.currentMedications}
              onChange={(e) => updatePatient({ currentMedications: e.target.value })}
              disabled={!canEdit}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {canEdit && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Fushat me * janë të detyrueshme për pranim</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Duke ruajtur..." : isDraftRecord || !hasExistingRecord ? "Ruaj draftin" : "Ruaj ndryshimet"}
            </Button>
            {!patient.isDischarged && !isPatientAdmitted && (
              <Button onClick={handleConfirmAdmission} disabled={!isFormValid || isSaving}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Konfirmo pranimin
              </Button>
            )}
            {isPatientAdmitted && <Button onClick={() => router.push("/epicrisis")}>Vazhdo te epikriza</Button>}
          </div>
        </div>
      )}
    </div>
  )
}
