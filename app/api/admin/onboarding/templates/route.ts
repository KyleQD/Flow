import { NextRequest, NextResponse } from "next/server"
import { OnboardingTemplatesService } from "@/lib/services/onboarding-templates.service"
import { getAuthUser } from "@/lib/auth"
import { z } from "zod"

const createTemplateSchema = z.object({
  venue_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  department: z.string().min(1),
  position: z.string().min(1),
  employment_type: z.enum(['full_time', 'part_time', 'contractor', 'volunteer', 'intern']),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'email', 'phone', 'date', 'select', 'multiselect', 'textarea', 'file', 'checkbox', 'number', 'address', 'emergency_contact', 'bank_info', 'tax_info', 'id_document']),
    label: z.string(),
    required: z.boolean(),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      custom: z.string().optional()
    }).optional(),
    help_text: z.string().optional(),
    order: z.number(),
    section: z.string()
  })),
  estimated_days: z.number().min(1),
  required_documents: z.array(z.string()),
  assignees: z.array(z.string()),
  tags: z.array(z.string()),
  is_default: z.boolean().optional()
})

const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: z.string().uuid()
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get('venue_id')

    if (!venueId) {
      return NextResponse.json({ error: "Venue ID is required" }, { status: 400 })
    }

    const templates = await OnboardingTemplatesService.getTemplates(venueId)

    return NextResponse.json({ 
      success: true, 
      data: templates 
    })
  } catch (error: any) {
    console.error("Error fetching onboarding templates:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    const template = await OnboardingTemplatesService.createTemplate({
      ...validatedData,
      created_by: user.id,
      use_count: 0
    })

    return NextResponse.json({ 
      success: true, 
      data: template 
    })
  } catch (error: any) {
    console.error("Error creating onboarding template:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTemplateSchema.parse(body)

    const { id, ...updates } = validatedData
    const template = await OnboardingTemplatesService.updateTemplate(id, updates)

    return NextResponse.json({ 
      success: true, 
      data: template 
    })
  } catch (error: any) {
    console.error("Error updating onboarding template:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update template" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 })
    }

    await OnboardingTemplatesService.deleteTemplate(templateId)

    return NextResponse.json({ 
      success: true, 
      message: "Template deleted successfully" 
    })
  } catch (error: any) {
    console.error("Error deleting onboarding template:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete template" },
      { status: 500 }
    )
  }
} 