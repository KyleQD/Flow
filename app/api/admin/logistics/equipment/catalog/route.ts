import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

// Validation schemas
const CreateEquipmentCatalogSchema = z.object({
  vendorId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  category: z.enum(['sound', 'lighting', 'stage', 'power', 'generator', 'tent', 'furniture', 'catering', 'security', 'transportation', 'decor', 'custom']),
  subcategory: z.string().max(100).optional(),
  model: z.string().max(255).optional(),
  manufacturer: z.string().max(255).optional(),
  dimensions: z.object({
    width: z.number().min(0),
    height: z.number().min(0),
    depth: z.number().min(0)
  }).optional(),
  weight: z.number().min(0).optional(),
  powerConsumption: z.number().min(0).optional(),
  voltageRequirements: z.string().max(50).optional(),
  symbolType: z.enum(['rectangle', 'circle', 'triangle', 'custom']).default('rectangle'),
  symbolColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3b82f6'),
  symbolSize: z.number().min(10).max(200).default(40),
  iconName: z.string().max(100).optional(),
  isPortable: z.boolean().default(true),
  requiresSetup: z.boolean().default(false),
  setupTimeMinutes: z.number().min(0).default(0),
  requiresPower: z.boolean().default(false),
  requiresWater: z.boolean().default(false),
  requiresInternet: z.boolean().default(false),
  weatherResistant: z.boolean().default(false),
  dailyRate: z.number().min(0).optional(),
  weeklyRate: z.number().min(0).optional(),
  securityDeposit: z.number().min(0).optional(),
  description: z.string().optional(),
  setupInstructions: z.string().optional(),
  imageUrl: z.string().url().optional()
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const vendorId = searchParams.get('vendorId')

    // Build query
    let query = supabase
      .from('equipment_catalog')
      .select(`
        *,
        created_by_profile:profiles!equipment_catalog_created_by_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,model.ilike.%${search}%,manufacturer.ilike.%${search}%`)
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId)
    }

    const { data: equipment, error } = await query

    if (error) {
      console.error('Error fetching equipment catalog:', error)
      return NextResponse.json({ error: "Failed to fetch equipment catalog" }, { status: 500 })
    }

    return NextResponse.json({ equipment })

  } catch (error) {
    console.error('Equipment catalog GET error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = CreateEquipmentCatalogSchema.parse(body)

    // Create equipment in database
    const { data: equipment, error } = await supabase
      .from('equipment_catalog')
      .insert({
        ...validatedData,
        created_by: user.id
      })
      .select(`
        *,
        created_by_profile:profiles!equipment_catalog_created_by_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Error creating equipment:', error)
      return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('site_map_activity_log')
      .insert({
        site_map_id: null, // Equipment catalog is global
        user_id: user.id,
        action: 'equipment_catalog_created',
        details: {
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          category: equipment.category
        }
      })

    return NextResponse.json({ equipment }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Equipment catalog POST error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
