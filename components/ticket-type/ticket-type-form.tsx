'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useTransition } from 'react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast' 

// Adjust the import path according to your project structure and aliases
import { createTicketTypeAction } from '@/app/lib/actions/ticket-type.actions'

// Client-side schema for form validation
const ticketTypeFormSchema = z.object({
  name: z.string().min(3, 'Ticket type name must be at least 3 characters').max(100),
  price: z.coerce.number()
    .positive('Price must be a positive number')
    .refine(p => (p * 100) % 1 === 0, { 
      message: 'Price must have at most two decimal places.',
    }),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  requiresRegistration: z.boolean().default(false),
  // currency: z.string().length(3).default('usd'), // Can be added as a form field if needed
})

type TicketTypeFormValues = z.infer<typeof ticketTypeFormSchema>

interface TicketType {
    id: string
    name: string
    price: number
    stripePriceId: string
}

interface TicketTypeFormProps {
  eventId: string
  onTicketTypeCreated?: (ticketType: TicketType) => void
  // currency?: string; // If you want to enforce a currency per event from a prop
}

export function TicketTypeForm({ eventId, onTicketTypeCreated }: TicketTypeFormProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<TicketTypeFormValues>({
    resolver: zodResolver(ticketTypeFormSchema),
    defaultValues: {
      name: '',
      price: undefined, // Use undefined for number inputs to show placeholder
      quantity: 100,
      requiresRegistration: false,
    },
  })

  function onSubmit(data: TicketTypeFormValues) {
    startTransition(async () => {
      const result = await createTicketTypeAction({
        ...data,
        eventId,
        // currency: data.currency || 'usd', // Pass currency if it's part of the form
      })

      if ((result as any).success && (result as any).ticketType) {
        toast({
          title: 'Ticket Type Created',
          description: `Successfully created ${(result as any).ticketType.name}.`,
        })
        form.reset()
        if (onTicketTypeCreated) {
          onTicketTypeCreated((result as any).ticketType as TicketType)
        }
      } else {
        toast({
          title: 'Error',
          description: (result as any).error || 'Failed to create ticket type.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create New Ticket Type</CardTitle>
        <CardDescription>Add a new ticket category for your event. This will also create a corresponding product and price in Stripe.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., General Admission, VIP Section" {...field} />
                  </FormControl>
                  <FormDescription>The public name of this ticket type.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 25.50" {...field} step="0.01" />
                  </FormControl>
                  <FormDescription>Price per ticket. Currency is USD by default (handled server-side).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Available</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                  </FormControl>
                  <FormDescription>Total number of tickets available for this type.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requiresRegistration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="requiresRegistration"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel htmlFor="requiresRegistration" className="cursor-pointer">
                      Require Attendee Registration?
                    </FormLabel>
                    <FormDescription>
                      If checked, attendees may need to provide additional details for this ticket.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? 'Creating Ticket Type...' : 'Create Ticket Type'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 