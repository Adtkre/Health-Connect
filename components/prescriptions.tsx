"use client"

import React, { useState } from "react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Sparkles, Trash2, Edit2, Pill } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { pushNotification } from "@/components/notification-center"

export default function Prescriptions() {
  const { prescriptions, addPrescription, updatePrescription, removePrescription, syncPrescription } = useApp()
  const { toast } = useToast()
  const [medication, setMedication] = useState("")
  const [medications, setMedications] = useState<Array<{ name: string; dosage: string }>>([])
  const [medInput, setMedInput] = useState("")
  const [doseInput, setDoseInput] = useState("")
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [syncingIds, setSyncingIds] = useState<string[]>([])
  const [suggestingIds, setSuggestingIds] = useState<string[]>([])
  const [suggestionSummaries, setSuggestionSummaries] = useState<Record<string, string>>({})
  const [takenPrescriptions, setTakenPrescriptions] = useState<Record<string, Date[]>>(() => {
    const saved = localStorage.getItem("takenPrescriptions")
    return saved ? JSON.parse(saved) : {}
  })

  const addMedication = () => {
    if (medInput.trim() && doseInput.trim() && !medications.find((m) => m.name === medInput.trim())) {
      setMedications([...medications, { name: medInput.trim(), dosage: doseInput.trim() }])
      setMedInput("")
      setDoseInput("")
    }
  }

  const removeMedication = (name: string) => {
    setMedications(medications.filter((m) => m.name !== name))
  }

  const startEdit = (id: string) => {
    const p = prescriptions.find((x) => x.id === id)
    if (!p) return
    setEditingId(id)
    setMedications([{ name: p.medication, dosage: p.dosage }])
    setStartDate(p.startDate)
    setEndDate(p.endDate || "")
    setNotes(p.notes || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setMedications([])
    setMedInput("")
    setDoseInput("")
    setStartDate(new Date().toISOString().slice(0, 10))
    setEndDate("")
    setNotes("")
  }

  const submit = () => {
    if (medications.length === 0) {
      toast({ title: "Error", description: "Add at least one medication" })
      return
    }
    const med = medications[0]
    if (editingId) {
      updatePrescription(editingId, { medication: med.name, dosage: med.dosage, startDate, endDate: endDate || undefined, notes })
      pushNotification("success", "Prescription Updated", `${med.name} has been updated`)
    } else {
      addPrescription({ medication: med.name, dosage: med.dosage, startDate, endDate: endDate || undefined, notes })
      pushNotification("success", "Prescription Added", `${med.name} added to your medications`)
    }
    cancelEdit()
    toast({ title: "Saved", description: editingId ? "Prescription updated" : "Prescription added" })
  }

  const getAISuggestions = async (id: string) => {
    setSuggestingIds((prev) => [...prev, id])
    try {
      const p = prescriptions.find((x) => x.id === id)
      if (!p) throw new Error("Prescription not found")

      const res = await fetch("/api/gemini/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ai_suggest_rx",
          data: p,
          allPrescriptions: prescriptions,
        }),
      })
      if (!res.ok) throw new Error("Suggestion failed")
      const json = await res.json()
      setSuggestionSummaries((prev) => ({ ...prev, [id]: json.summary }))
      toast({ title: "Suggestions loaded", description: "AI recommendations ready" })
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Could not get suggestions" })
    } finally {
      setSuggestingIds((prev) => prev.filter((x) => x !== id))
    }
  }

  const markAsTaken = (prescriptionId: string, medicationName: string) => {
    setTakenPrescriptions((prev) => {
      const updated = {
        ...prev,
        [prescriptionId]: [...(prev[prescriptionId] || []), new Date()],
      }
      localStorage.setItem("takenPrescriptions", JSON.stringify(updated))
      return updated
    })
    pushNotification("success", "Prescription Taken", `You took ${medicationName} at ${new Date().toLocaleTimeString()}`)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Form Card */}
      <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3 mb-5">
          <Pill className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-xl text-foreground">Prescriptions</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="rx-med" className="text-sm font-semibold text-foreground">Medication</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="rx-med"
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  placeholder="e.g. Aspirin"
                  className="bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700"
                />
                <Button onClick={addMedication} size="sm" className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="rx-dose" className="text-sm font-semibold text-foreground">Dosage</Label>
              <Input
                id="rx-dose"
                value={doseInput}
                onChange={(e) => setDoseInput(e.target.value)}
                placeholder="e.g. 500mg twice daily"
                className="mt-2 bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700"
              />
            </div>
          </div>

          {medications.length > 0 && (
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Medications</Label>
              <div className="flex flex-wrap gap-2">
                {medications.map((m) => (
                  <Badge key={m.name} className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 hover:bg-emerald-200 dark:hover:bg-emerald-800 cursor-pointer flex items-center gap-2">
                    {m.name} — {m.dosage}
                    <button onClick={() => removeMedication(m.name)} className="ml-1 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="rx-start" className="text-sm font-semibold text-foreground">Start Date</Label>
              <Input id="rx-start" type="date" className="mt-2 bg-white dark:bg-slate-900 text-foreground border-gray-300 dark:border-slate-700" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rx-end" className="text-sm font-semibold text-foreground">End Date (Optional)</Label>
              <Input id="rx-end" type="date" className="mt-2 bg-white dark:bg-slate-900 text-foreground border-gray-300 dark:border-slate-700" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="rx-notes" className="text-sm font-semibold text-foreground">Notes</Label>
            <Textarea id="rx-notes" className="mt-2 bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Directions, side effects, etc..." />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={submit} className="flex-1 h-10 font-semibold">
              {editingId ? "Update Prescription" : "Add Prescription"}
            </Button>
            {editingId && <Button variant="outline" onClick={cancelEdit} className="flex-1 h-10 font-semibold">Cancel</Button>}
          </div>
        </div>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {prescriptions.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-gray-300 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">No prescriptions yet. Start by adding your first medication.</p>
          </Card>
        ) : (
          prescriptions.slice().reverse().map((p) => (
            <Card key={p.id} className="p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-slate-800 bg-card">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {p.startDate} {p.endDate ? `— ${p.endDate}` : ""}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className="px-3 py-1.5 text-sm font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {p.medication}
                    </Badge>
                    <span className="text-xs text-foreground bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium">{p.dosage}</span>
                  </div>
                  {p.notes && <p className="text-sm text-foreground mt-2 bg-gray-50 dark:bg-slate-900 p-2 rounded">{p.notes}</p>}
                </div>

                {p.geminiSummary && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-purple-900 dark:text-purple-300 mb-1">AI Summary</div>
                        <p className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-line">{p.geminiSummary}</p>
                        {p.syncedAt && <div className="text-xs text-purple-700 dark:text-purple-300 mt-1 opacity-75">Synced {new Date(p.syncedAt).toLocaleString()}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {suggestionSummaries[p.id] && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-blue-900 dark:text-blue-300 mb-1">AI Suggestions</div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">{suggestionSummaries[p.id]}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => markAsTaken(p.id, p.medication)}
                    className="gap-1.5 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Take Now
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(p.id)} className="gap-1.5 h-8 text-xs">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      removePrescription(p.id)
                      pushNotification("info", "Prescription Deleted", `${p.medication} has been removed`)
                    }} 
                    className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => getAISuggestions(p.id)}
                    disabled={suggestingIds.includes(p.id)}
                    className="gap-1.5 h-8 text-xs"
                  >
                    {suggestingIds.includes(p.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Suggestions
                  </Button>

                  {takenPrescriptions[p.id] && takenPrescriptions[p.id].length > 0 && (
                    <div className="col-span-full text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20 p-2 rounded mt-1">
                      Last taken: {new Date(takenPrescriptions[p.id][takenPrescriptions[p.id].length - 1]).toLocaleString()} ({takenPrescriptions[p.id].length}x)
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
