"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClinic } from "@/lib/clinic-context"
import { generateEntryId } from "@/lib/mock-data"
import type { Diagnosis } from "@/lib/types"
import { Plus, User, Clock, Stethoscope } from "lucide-react"

export function DiagnosesSection() {
  const { epicrisis, updateEpicrisis, currentDoctor, hasPermission } = useClinic()
  const [newDiagnosis, setNewDiagnosis] = useState("")
  const [icdCode, setIcdCode] = useState("")
  const canEdit = hasPermission("edit")

  const handleAddDiagnosis = () => {
    if (!newDiagnosis.trim()) return

    const diagnosis: Diagnosis = {
      id: generateEntryId(),
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      diagnosis: newDiagnosis,
      icdCode: icdCode || undefined,
    }

    updateEpicrisis({ diagnoses: [...epicrisis.diagnoses, diagnosis] })
    setNewDiagnosis("")
    setIcdCode("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnozat</CardTitle>
        <CardDescription>Regjistroni diagnozat e pacientit me kode ICD</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="diagnosis">Diagnoza</Label>
              <Input
                id="diagnosis"
                placeholder="Shkruani diagnozën..."
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icdCode">Kodi ICD (opsionale)</Label>
              <Input
                id="icdCode"
                placeholder="e.g., J18.9"
                value={icdCode}
                onChange={(e) => setIcdCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddDiagnosis} disabled={!newDiagnosis.trim()} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Shto diagnozë
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {epicrisis.diagnoses.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Ende nuk ka diagnoza të regjistruara</p>
          ) : (
            epicrisis.diagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {diagnosis.doctorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {diagnosis.date} në {diagnosis.time}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Stethoscope className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{diagnosis.diagnosis}</p>
                    {diagnosis.icdCode && (
                      <p className="font-mono text-sm text-muted-foreground">{diagnosis.icdCode}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
