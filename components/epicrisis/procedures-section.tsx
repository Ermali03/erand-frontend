"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useClinic } from "@/lib/clinic-context"
import { generateEntryId } from "@/lib/mock-data"
import type { Procedure } from "@/lib/types"
import { Plus, User, Clock, Syringe } from "lucide-react"

export function ProceduresSection() {
  const { epicrisis, updateEpicrisis, currentDoctor, hasPermission } = useClinic()
  const [formData, setFormData] = useState({ procedureName: "", notes: "" })
  const canEdit = hasPermission("edit")

  const handleAddProcedure = () => {
    if (!formData.procedureName.trim()) return

    const procedure: Procedure = {
      id: generateEntryId(),
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      procedureName: formData.procedureName,
      notes: formData.notes,
    }

    updateEpicrisis({ procedures: [...epicrisis.procedures, procedure] })
    setFormData({ procedureName: "", notes: "" })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procedures</CardTitle>
        <CardDescription>Non-surgical procedures performed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="procedureName">Procedure Name</Label>
                <Input
                  id="procedureName"
                  placeholder="e.g., Central line insertion"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedureNotes">Notes</Label>
                <Input
                  id="procedureNotes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddProcedure} disabled={!formData.procedureName.trim()} size="sm" className="w-fit">
              <Plus className="mr-2 h-4 w-4" />
              Add Procedure
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {epicrisis.procedures.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No procedures recorded yet</p>
          ) : (
            epicrisis.procedures.map((procedure) => (
              <div key={procedure.id} className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {procedure.doctorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {procedure.date} at {procedure.time}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Syringe className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{procedure.procedureName}</p>
                    {procedure.notes && <p className="text-sm text-muted-foreground">{procedure.notes}</p>}
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
