import { z } from "zod"

export const tourBasicInfoSchema = z.object({
  name: z.string().min(3, "Tour name must be at least 3 characters"),
  description: z.string().max(200, "Description must be at most 200 characters").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.number().min(0, "Budget must be a positive number"),
})

export interface TourBasicInfo extends z.infer<typeof tourBasicInfoSchema> {} 