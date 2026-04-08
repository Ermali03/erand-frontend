"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useClinic } from "@/lib/clinic-context"
import { generateEntryId } from "@/lib/mock-data"
import type { ProgressNote } from "@/lib/types"
import { Plus, User, Clock } from "lucide-react"

export function ProgressNotesSection() {
  const { epicrisis, updateEpicrisis, currentDoctor, hasPermission } = useClinic()
  const [newNote, setNewNote] = useState("")
  const canEdit = hasPermission("edit")

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note: ProgressNote = {
      id: generateEntryId(),
      doctorId: currentDoctor.id,
      doctorName: currentDoctor.name,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: newNote,
    }

    updateEpicrisis({ progressNotes: [...epicrisis.progressNotes, note] })
    setNewNote("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress Notes</CardTitle>
        <CardDescription>Document patient progress during hospitalization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="space-y-3">
            <Textarea
              placeholder="Enter progress note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {epicrisis.progressNotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No progress notes recorded yet</p>
          ) : (
            epicrisis.progressNotes.map((note) => (
              <div key={note.id} className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {note.doctorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {note.date} at {note.time}
                  </span>
                  <span className="font-mono text-xs">{note.doctorId}</span>
                </div>
                <p className="text-sm">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
