"use client"

import React, { useState } from "react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus, Sparkles, Trash2, Edit2, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function MedicalHistory() {
  const { medicalHistory, addMedicalRecord, updateMedicalRecord, removeMedicalRecord, syncMedicalRecord } = useApp()
  const { toast } = useToast()
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [conditions, setConditions] = useState<string[]>([])
  const [conditionInput, setConditionInput] = useState("")
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [syncingIds, setSyncingIds] = useState<string[]>([])
  const [suggestingIds, setSuggestingIds] = useState<string[]>([])
  const [suggestionSummaries, setSuggestionSummaries] = useState<Record<string, string>>({})

  const addCondition = () => {
    if (conditionInput.trim() && !conditions.includes(conditionInput.trim())) {
      setConditions([...conditions, conditionInput.trim()])
      setConditionInput("")
    }
  }

  const removeCondition = (c: string) => {
    setConditions(conditions.filter((x) => x !== c))
  }

  const startEdit = (id: string) => {
    const rec = medicalHistory.find((r) => r.id === id)
    if (!rec) return
    setEditingId(id)
    setDate(rec.date)
    setConditions(rec.condition.split(",").map((x) => x.trim()))
    setNotes(rec.notes || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDate(new Date().toISOString().slice(0, 10))
    setConditions([])
    setConditionInput("")
    setNotes("")
  }

  const submit = () => {
    if (conditions.length === 0) {
      toast({ title: "Error", description: "Add at least one condition" })
      return
    }
    if (editingId) {
      updateMedicalRecord(editingId, { date, condition: conditions.join(", "), notes })
    } else {
      addMedicalRecord({ date, condition: conditions.join(", "), notes })
    }
    cancelEdit()
    toast({ title: "Saved", description: editingId ? "Record updated" : "Record added" })
  }

  const getAISuggestions = async (id: string) => {
    setSuggestingIds((prev) => [...prev, id])
    try {
      const rec = medicalHistory.find((r) => r.id === id)
      if (!rec) throw new Error("Record not found")

      const res = await fetch("/api/gemini/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ai_suggest",
          data: rec,
          allRecords: medicalHistory,
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Form Card */}
      <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3 mb-5">
          <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-xl text-foreground">Medical History</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="mh-date" className="text-sm font-semibold text-foreground">Date</Label>
              <Input id="mh-date" type="date" className="mt-2 bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="mh-condition" className="text-sm font-semibold text-foreground">Add Condition</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="mh-condition"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyPress={(e) => { if (e.key === "Enter") addCondition() }}
                  placeholder="e.g. Asthma, Diabetes"
                  className="bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700"
                />
                <Button onClick={addCondition} size="sm" className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {conditions.length > 0 && (
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {conditions.map((c) => (
                  <Badge key={c} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer flex items-center gap-2">
                    {c}
                    <button onClick={() => removeCondition(c)} className="ml-1 hover:text-blue-700 dark:hover:text-blue-300 font-bold">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="mh-notes" className="text-sm font-semibold text-foreground">Notes</Label>
            <Textarea id="mh-notes" className="mt-2 bg-white dark:bg-slate-900 text-foreground placeholder:text-muted-foreground border-gray-300 dark:border-slate-700" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Additional details..." />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={submit} className="flex-1 h-10 font-semibold">
              {editingId ? "Update Record" : "Add Record"}
            </Button>
            {editingId && <Button variant="outline" onClick={cancelEdit} className="flex-1 h-10 font-semibold">Cancel</Button>}
          </div>
        </div>
      </Card>

      {/* Records List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {medicalHistory.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-gray-300 dark:border-slate-700">
            <p className="text-sm text-muted-foreground">No medical history yet. Start by adding your first condition.</p>
          </Card>
        ) : (
          medicalHistory.slice().reverse().map((r) => (
            <Card key={r.id} className="p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-slate-800 bg-card">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {r.condition.split(",").map((cond) => (
                      <Badge key={cond} className="px-2.5 py-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {cond.trim()}
                      </Badge>
                    ))}
                  </div>
                  {r.notes && <p className="text-sm text-foreground mt-2 bg-gray-50 dark:bg-slate-900 p-2 rounded">{r.notes}</p>}
                </div>

                {r.geminiSummary && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-amber-900 dark:text-amber-300 mb-1">AI Summary</div>
                        <p className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-line">{r.geminiSummary}</p>
                        {r.syncedAt && <div className="text-xs text-amber-700 dark:text-amber-300 mt-1 opacity-75">Synced {new Date(r.syncedAt).toLocaleString()}</div>}
                      </div>
                    </div>
                  </div>
                )}

                {suggestionSummaries[r.id] && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-green-900 dark:text-green-300 mb-1">AI Suggestions</div>
                        <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">{suggestionSummaries[r.id]}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(r.id)} className="gap-1.5 h-8 text-xs">
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => removeMedicalRecord(r.id)} className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => getAISuggestions(r.id)}
                    disabled={suggestingIds.includes(r.id)}
                    className="gap-1.5 h-8 text-xs"
                  >
                    {suggestingIds.includes(r.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Suggestions
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
