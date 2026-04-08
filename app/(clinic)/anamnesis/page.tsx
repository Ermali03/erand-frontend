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
import { Save, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AnamnesisPage() {
  const router = useRouter()
  const { patient, updatePatient, isPatientAdmitted, confirmAdmission, hasPermission } = useClinic()
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedMessage, setShowSavedMessage] = useState(false)

  const canEdit = hasPermission("edit")

  const handleSaveDraft = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowSavedMessage(true)
      setTimeout(() => setShowSavedMessage(false), 3000)
    }, 500)
  }

  const handleConfirmAdmission = () => {
    if (!patient.fullName || !patient.dateOfBirth || !patient.reasonForAdmission) {
      return
    }
    confirmAdmission()
    updatePatient({ status: "in-treatment" })
  }

  const isFormValid = patient.fullName && patient.dateOfBirth && patient.reasonForAdmission

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Anamnesis</h1>
          <p className="text-muted-foreground">Register a new patient when admitted</p>
        </div>
        {patient.isDischarged && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2">
            <Lock className="h-4 w-4 text-success" />
            <span className="text-sm text-success">Patient discharged, editing still allowed</span>
          </div>
        )}
      </div>

      {showSavedMessage && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">Draft saved successfully</AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic patient demographics</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter patient's full name"
              value={patient.fullName}
              onChange={(e) => updatePatient({ fullName: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              Date of Birth <span className="text-destructive">*</span>
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
            <Label>Gender</Label>
            <RadioGroup
              value={patient.gender}
              onValueChange={(value: "male" | "female" | "other") => updatePatient({ gender: value })}
              disabled={!canEdit}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal">
                  Male
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal">
                  Female
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter patient's address"
              value={patient.address}
              onChange={(e) => updatePatient({ address: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
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
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              placeholder="Name and phone number"
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
          <CardTitle>Admission Details</CardTitle>
          <CardDescription>Information about the current admission</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admissionSource">Admission Source</Label>
            <Select
              value={patient.admissionSource}
              onValueChange={(value: "ED" | "Clinic") => updatePatient({ admissionSource: value })}
              disabled={!canEdit}
            >
              <SelectTrigger id="admissionSource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ED">Emergency Department</SelectItem>
                <SelectItem value="Clinic">Clinic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admissionDateTime">Admission Date & Time</Label>
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
              Reason for Admission <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reasonForAdmission"
              placeholder="Describe the reason for admission"
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
          <CardTitle>Medical History</CardTitle>
          <CardDescription>Patient&apos;s medical background</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="pastMedicalHistory">Past Medical History</Label>
            <Textarea
              id="pastMedicalHistory"
              placeholder="Previous conditions, surgeries, hospitalizations..."
              value={patient.pastMedicalHistory}
              onChange={(e) => updatePatient({ pastMedicalHistory: e.target.value })}
              disabled={!canEdit}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              placeholder="List any known allergies (medications, food, environmental)..."
              value={patient.allergies}
              onChange={(e) => updatePatient({ allergies: e.target.value })}
              disabled={!canEdit}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              placeholder="List current medications with dosages..."
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
            <span>Fields marked with * are required for admission</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            {!isPatientAdmitted && (
              <Button onClick={handleConfirmAdmission} disabled={!isFormValid}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Admission
              </Button>
            )}
            {isPatientAdmitted && <Button onClick={() => router.push("/epicrisis")}>Continue to Epicrisis</Button>}
          </div>
        </div>
      )}
    </div>
  )
}
