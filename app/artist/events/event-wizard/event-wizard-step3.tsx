"use client"

import React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  venueName: z.string().min(2, "Venue name required"),
  capacity: z.coerce.number().min(1, "Capacity required"),
  contractFile: z.any().optional(),
  permits: z.array(z.any()).optional()
})

export interface EventWizardStep3Data {
  venueName: string
  capacity: number
  contractFile?: File | null
  permits?: (File | null)[]
}

interface EventWizardStep3Props {
  onNext: (data: EventWizardStep3Data) => void
  defaultValues?: Partial<EventWizardStep3Data>
}

interface FormValues {
  venueName: string
  capacity: number
  contractFile?: File | null
  permits: (File | null)[]
}

export function EventWizardStep3({ onNext, defaultValues }: EventWizardStep3Props) {
  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { permits: [] }
  })
  // @ts-expect-error: react-hook-form type inference issue for dynamic field name
  const { fields, append, remove } = useFieldArray({ control, name: "permits" })
  const permits = watch("permits")

  function onSubmit(data: FormValues) {
    onNext(data)
  }

  function handleContractChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("contractFile", e.target.files?.[0] || null)
  }

  function handlePermitChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    setValue(`permits.${idx}` as const, files?.[0] || null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Venue Name" {...register("venueName")}/>
        {errors.venueName && <div className="text-red-500 text-xs mt-1">{errors.venueName.message}</div>}
      </div>
      <div>
        <Input type="number" placeholder="Capacity" {...register("capacity")}/>
        {errors.capacity && <div className="text-red-500 text-xs mt-1">{errors.capacity.message}</div>}
      </div>
      <div>
        <label className="block text-white mb-1">Venue Contract (PDF)</label>
        <Input type="file" accept="application/pdf" onChange={handleContractChange} />
        {errors.contractFile && <div className="text-red-500 text-xs mt-1">{errors.contractFile.message as string}</div>}
      </div>
      <div>
        <div className="font-semibold text-white mb-2">Permits & Compliance Files</div>
        {fields.map((field, idx) => (
          <div key={field.id} className="flex gap-2 mb-2 items-end">
            <Input type="file" accept="application/pdf" onChange={e => handlePermitChange(idx, e)} />
            <Button type="button" variant="destructive" onClick={() => remove(idx)} disabled={fields.length === 1}>Remove</Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => append(null)} className="mt-2">Add Permit</Button>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full mt-2">Next</Button>
    </form>
  )
} 