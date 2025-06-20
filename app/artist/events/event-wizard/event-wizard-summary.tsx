"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { EventWizardStep1Data } from "./event-wizard-step1"
import type { EventWizardStep2Data } from "./event-wizard-step2"
import type { EventWizardStep3Data } from "./event-wizard-step3"

interface EventWizardSummaryProps {
  data: Partial<EventWizardStep1Data & EventWizardStep2Data & EventWizardStep3Data>
  onBack: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function EventWizardSummary({ data, onBack, onSubmit, isSubmitting }: EventWizardSummaryProps) {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-2">Review & Confirm</h2>
      <div>
        <div className="font-semibold text-white">Basic Info</div>
        <div className="text-gray-300">Name: {data.name}</div>
        <div className="text-gray-300">Type: {data.type}</div>
        <div className="text-gray-300">Date: {data.date}</div>
        <div className="text-gray-300">Location: {data.location}</div>
        <div className="text-gray-300">Objectives: {data.objectives || <span className="italic">None</span>}</div>
      </div>
      <div>
        <div className="font-semibold text-white">Schedule & Tasks</div>
        <div className="text-gray-300">Start: {data.startDate}</div>
        <div className="text-gray-300">End: {data.endDate}</div>
        <div className="text-gray-300">Tasks:</div>
        <ul className="ml-4 list-disc text-gray-300">
          {data.tasks?.map((task, i) => (
            <li key={i}>{task.title} (Due: {task.dueDate})</li>
          )) || <li className="italic">None</li>}
        </ul>
      </div>
      <div>
        <div className="font-semibold text-white">Venue & Compliance</div>
        <div className="text-gray-300">Venue: {data.venueName}</div>
        <div className="text-gray-300">Capacity: {data.capacity}</div>
        <div className="text-gray-300">Contract: {data.contractFile ? (data.contractFile as File).name : <span className="italic">None</span>}</div>
        <div className="text-gray-300">Permits:</div>
        <ul className="ml-4 list-disc text-gray-300">
          {data.permits?.length
            ? data.permits.map((file, i) => (
                <li key={i}>{file ? (file as File).name : <span className="italic">None</span>}</li>
              ))
            : <li className="italic">None</li>}
        </ul>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={isSubmitting}>Back</Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting} className="bg-purple-600 text-white">{isSubmitting ? "Submitting..." : "Submit Event"}</Button>
      </div>
    </Card>
  )
} 