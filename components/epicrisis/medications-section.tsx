"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useClinic } from "@/lib/clinic-context"
import { generateEntryId } from "@/lib/mock-data"
import type { Medication } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

export function MedicationsSection() {
  const { epicrisis, updateEpicrisis, currentDoctor, hasPermission } = useClinic()
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    route: "oral",
  })
  const canEdit = hasPermission("edit")

  const handleAddMedication = () => {
    if (!formData.name.trim() || !formData.dosage.trim()) return

    const medication: Medication = {
      id: generateEntryId(),
      name: formData.name,
      dosage: formData.dosage,
      frequency: formData.frequency,
      route: formData.route,
      startDate: new Date().toLocaleDateString(),
      prescribedBy: currentDoctor.name,
    }

    updateEpicrisis({ medications: [...epicrisis.medications, medication] })
    setFormData({ name: "", dosage: "", frequency: "", route: "oral" })
  }

  const handleRemoveMedication = (id: string) => {
    updateEpicrisis({ medications: epicrisis.medications.filter((m) => m.id !== id) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terapia</CardTitle>
        <CardDescription>Barnat gjatë hospitalizimit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="medName">Ilaçi</Label>
              <Input
                id="medName"
                placeholder="e.g., Amoxicillin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Doza</Label>
              <Input
                id="dosage"
                placeholder="e.g., 500mg"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Shpeshtësia</Label>
              <Input
                id="frequency"
                placeholder="e.g., 3x daily"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Rruga e aplikimit</Label>
              <Select value={formData.route} onValueChange={(value) => setFormData({ ...formData, route: value })}>
                <SelectTrigger id="route">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Orale</SelectItem>
                  <SelectItem value="iv">IV</SelectItem>
                  <SelectItem value="im">IM</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="topical">Lokale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddMedication}
                disabled={!formData.name.trim() || !formData.dosage.trim()}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Shto
              </Button>
            </div>
          </div>
        )}

        {epicrisis.medications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Ende nuk ka terapi të regjistruar</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ilaçi</TableHead>
                  <TableHead>Doza</TableHead>
                  <TableHead>Shpeshtësia</TableHead>
                  <TableHead>Rruga</TableHead>
                  <TableHead>Përshkruar nga</TableHead>
                  {canEdit && <TableHead className="w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {epicrisis.medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.frequency}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase">
                        {med.route}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{med.prescribedBy}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMedication(med.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
