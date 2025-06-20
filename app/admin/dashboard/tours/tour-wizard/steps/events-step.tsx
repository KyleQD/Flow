import * as React from "react"
import { Button } from "@/components/ui/button"
import { Upload, Calendar, FileSpreadsheet, Plus, Download, Edit2 } from "lucide-react"

interface EventsStepProps {
  events: any[]
  onAdd: () => void
  onImport: (files: FileList) => void
  onExport: () => void
  onBulkEdit: () => void
}

export function EventsStep({ events, onAdd, onImport, onExport, onBulkEdit }: EventsStepProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onImport(e.dataTransfer.files)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) onImport(e.target.files)
  }

  return (
    <div>
      <div className="mb-4">
        <div className="rounded bg-slate-800/70 border border-slate-700 p-4 flex items-center text-slate-300 text-sm">
          Add shows, travel days, rest days, and other events to your tour schedule. You can add events manually or import them from a spreadsheet.
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4 justify-end">
        <Button variant="outline" className="text-slate-300 border-slate-600" onClick={onExport} size="sm">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
        <Button variant="outline" className="text-slate-300 border-slate-600" onClick={onBulkEdit} size="sm">
          <Edit2 className="h-4 w-4 mr-1" /> Bulk Edit
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={onAdd} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>
      <div className="mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${isDragging ? "border-purple-500 bg-purple-950/20" : "border-slate-700 bg-slate-900/30"}`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={e => { e.preventDefault(); setIsDragging(false) }}
          onDrop={handleDrop}
          tabIndex={0}
          aria-label="Import events from spreadsheet"
        >
          <Upload className="h-8 w-8 text-slate-400 mb-2" />
          <div className="text-slate-400 mb-1">Drag and drop or click to upload</div>
          <div className="text-xs text-slate-500 mb-2">Supports .xlsx, .xls, .csv (Max 5MB)</div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
            tabIndex={-1}
          />
          <Button variant="ghost" className="text-purple-400" onClick={() => fileInputRef.current?.click()}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Browse Files
          </Button>
        </div>
      </div>
      <div className="mb-6">
        {events.length === 0 ? (
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-10 flex flex-col items-center justify-center">
            <Calendar className="h-10 w-10 text-slate-500 mb-4" />
            <div className="text-slate-400 mb-2">No events added yet</div>
            <div className="text-slate-500 text-sm mb-4">Add shows, travel days, rest days, and other events to your tour schedule.</div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={onAdd}>
              Add First Event
            </Button>
          </div>
        ) : (
          <div className="text-slate-400">{/* TODO: Render events list/table here */}Events list goes here.</div>
        )}
      </div>
    </div>
  )
} 