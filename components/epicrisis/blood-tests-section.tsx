"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClinic } from "@/lib/clinic-context"
import { generateEntryId } from "@/lib/mock-data"
import type { BloodTest } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

export function BloodTestsSection() {
  const { epicrisis, updateEpicrisis, hasPermission } = useClinic()
  const [formData, setFormData] = useState({
    testName: "",
    value: "",
    unit: "",
    referenceRange: "",
  })
  const canEdit = hasPermission("edit")

  const handleAddTest = () => {
    if (!formData.testName.trim() || !formData.value.trim()) return

    const test: BloodTest = {
      id: generateEntryId(),
      testName: formData.testName,
      value: formData.value,
      unit: formData.unit,
      referenceRange: formData.referenceRange,
      date: new Date().toLocaleDateString(),
    }

    updateEpicrisis({ bloodTests: [...epicrisis.bloodTests, test] })
    setFormData({ testName: "", value: "", unit: "", referenceRange: "" })
  }

  const handleRemoveTest = (id: string) => {
    updateEpicrisis({ bloodTests: epicrisis.bloodTests.filter((t) => t.id !== id) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blood Tests</CardTitle>
        <CardDescription>Laboratory test results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="grid gap-3 sm:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                placeholder="e.g., Hemoglobin"
                value={formData.testName}
                onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                placeholder="e.g., 14.5"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="e.g., g/dL"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refRange">Reference Range</Label>
              <Input
                id="refRange"
                placeholder="e.g., 12-16"
                value={formData.referenceRange}
                onChange={(e) => setFormData({ ...formData, referenceRange: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddTest} disabled={!formData.testName.trim() || !formData.value.trim()} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        )}

        {epicrisis.bloodTests.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No blood tests recorded yet</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Reference Range</TableHead>
                  <TableHead>Date</TableHead>
                  {canEdit && <TableHead className="w-[50px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {epicrisis.bloodTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.testName}</TableCell>
                    <TableCell>
                      {test.value} {test.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {test.referenceRange} {test.unit}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{test.date}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTest(test.id)}>
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
