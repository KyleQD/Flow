"use client"

import React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ticketSchema = z.object({
  type: z.string().min(1, "Type required"),
  price: z.coerce.number().min(0, "Price required"),
  quantity: z.coerce.number().min(1, "Quantity required")
})

const schema = z.object({
  tickets: z.array(ticketSchema).min(1, "At least one ticket type required")
})

export interface EventWizardTicketingData {
  tickets: { type: string; price: number; quantity: number }[]
}

interface EventWizardTicketingProps {
  onNext: (data: EventWizardTicketingData) => void
  defaultValues?: Partial<EventWizardTicketingData>
}

export function EventWizardTicketing({ onNext, defaultValues }: EventWizardTicketingProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<EventWizardTicketingData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { tickets: [{ type: "", price: 0, quantity: 1 }] }
  })
  const { fields, append, remove } = useFieldArray({ control, name: "tickets" })

  function onSubmit(data: EventWizardTicketingData) {
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field, idx) => (
        <div key={field.id} className="flex gap-2 mb-2 items-end">
          <Input placeholder="Type" {...register(`tickets.${idx}.type` as const)} />
          <Input type="number" placeholder="Price" {...register(`tickets.${idx}.price` as const)} />
          <Input type="number" placeholder="Quantity" {...register(`tickets.${idx}.quantity` as const)} />
          <Button type="button" variant="destructive" onClick={() => remove(idx)} disabled={fields.length === 1}>Remove</Button>
        </div>
      ))}
      {errors.tickets && <div className="text-red-500 text-xs mt-1">{errors.tickets.message as string}</div>}
      <Button type="button" variant="secondary" onClick={() => append({ type: "", price: 0, quantity: 1 })} className="mt-2">Add Ticket Type</Button>
      <Button type="submit" disabled={isSubmitting} className="w-full mt-2">Next</Button>
    </form>
  )
} 